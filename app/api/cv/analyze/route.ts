import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const POLL_INTERVAL_MS = 2000
const MAX_WAIT_MS = 90_000

/** PDF/DOCX'ten metin çıkarır; cv-process raw_text beklediği için gerekli. unpdf kullanıyoruz (worker gerektirmez). */
async function extractTextFromCvFile(buffer: Buffer, fileUrl: string): Promise<string> {
  const lower = fileUrl.toLowerCase()
  if (lower.endsWith(".pdf")) {
    const { extractText, getDocumentProxy } = await import("unpdf")
    const pdf = await getDocumentProxy(new Uint8Array(buffer))
    const { text } = await extractText(pdf, { mergePages: true })
    return typeof text === "string" ? text.trim() : ""
  }
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
    const mammoth = await import("mammoth")
    const result = await mammoth.extractRawText({ buffer })
    return (result?.value ?? "").trim()
  }
  return ""
}

/**
 * POST /api/cv/analyze
 * Body: { cv_id: string }
 * If cvs.raw_text is empty, extracts text from file (PDF/DOCX), then triggers cv-process.
 */
export async function POST(req: NextRequest) {
  try {
    const { cv_id } = (await req.json()) as { cv_id?: string }
    if (!cv_id) {
      return NextResponse.json(
        { success: false, error: "cv_id is required" },
        { status: 400 }
      )
    }

    console.log("CV Analyze: incoming analyze request", { cv_id })

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: cvRow, error: fetchError } = await supabase
      .from("cvs")
      .select("id, developer_id, file_url, raw_text")
      .eq("id", cv_id)
      .single()

    if (fetchError || !cvRow) {
      return NextResponse.json(
        { success: false, error: "CV not found" },
        { status: 404 }
      )
    }

    const row = cvRow as {
      developer_id: string
      file_url: string | null
      raw_text: string | null
    }

    console.log("CV Analyze: fetched CV for analyze", {
      cv_id,
      developer_id: row.developer_id,
      user_id: user.id,
    })

    if (row.developer_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      )
    }

    const rawText = typeof row.raw_text === "string" ? row.raw_text.trim() : ""
    if (!rawText && row.file_url) {
      console.log("CV Analyze: raw_text missing, extracting from file", { cv_id })
      let storagePath = row.file_url
      if (storagePath.startsWith("http") && storagePath.includes("/cvs/")) {
        const parts = storagePath.split("/cvs/")
        storagePath = parts[1] ?? storagePath
      }
      try {
        const admin = createAdminClient()
        const { data: signed, error: signError } = await admin.storage
          .from("cvs")
          .createSignedUrl(storagePath, 3600)
        if (signError || !signed?.signedUrl) {
          console.error("CV Analyze: signed URL failed", signError)
          return NextResponse.json(
            { success: false, error: "CV dosyasına erişilemedi" },
            { status: 502 }
          )
        }
        const fileRes = await fetch(signed.signedUrl)
        if (!fileRes.ok) {
          return NextResponse.json(
            { success: false, error: "CV dosyası indirilemedi" },
            { status: 502 }
          )
        }
        const arrayBuffer = await fileRes.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const extractedText = await extractTextFromCvFile(buffer, row.file_url)
        if (!extractedText) {
          return NextResponse.json(
            { success: false, error: "CV dosyasından metin çıkarılamadı. Desteklenen formatlar: PDF, DOCX." },
            { status: 422 }
          )
        }
        const { error: updateError } = await supabase
          .from("cvs")
          .update({ raw_text: extractedText })
          .eq("id", cv_id)
        if (updateError) {
          console.error("CV Analyze: failed to save raw_text", updateError)
          return NextResponse.json(
            { success: false, error: "Metin kaydedilemedi" },
            { status: 500 }
          )
        }
        console.log("CV Analyze: raw_text extracted and saved", { cv_id, length: extractedText.length })
      } catch (err) {
        console.error("CV Analyze: extract text error", err)
        return NextResponse.json(
          {
            success: false,
            error: err instanceof Error ? err.message : "CV metin çıkarımı başarısız",
          },
          { status: 500 }
        )
      }
    } else if (!rawText) {
      return NextResponse.json(
        { success: false, error: "CV dosyası veya metin bulunamadı. Lütfen CV'yi tekrar yükleyin." },
        { status: 422 }
      )
    }

    const invokeRes = await fetch(`${url}/functions/v1/cv-process`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cv_id }),
    })

    console.log("CV Analyze: cv-process invoke response status", {
      cv_id,
      status: invokeRes.status,
    })

    if (!invokeRes.ok) {
      const errText = await invokeRes.text()
      console.error("cv-process invoke error", invokeRes.status, errText)
      const is422 = invokeRes.status === 422
      return NextResponse.json(
        {
          success: false,
          error: is422
            ? "CV metni işlenemedi. Lütfen PDF veya DOCX formatında tekrar yükleyin."
            : (errText || "Analiz başlatılamadı"),
        },
        { status: invokeRes.status }
      )
    }

    const deadline = Date.now() + MAX_WAIT_MS
    while (Date.now() < deadline) {
      const { data: cv, error } = await supabase
        .from("cvs")
        .select("id, status, parsed_data")
        .eq("id", cv_id)
        .single()

      if (error || !cv) {
        await sleep(POLL_INTERVAL_MS)
        continue
      }

      const status = (cv as { status?: string }).status

      console.log("CV Analyze: polled CV status", {
        cv_id,
        status,
      })
      if (status === "processed") {
        const parsed_data = (cv as { parsed_data?: Record<string, unknown> }).parsed_data ?? null
        let cv_profile: Record<string, unknown> | null = null
        const { data: profileRow } = await supabase
          .from("cv_profiles")
          .select("skills, experience_years, roles, seniority, summary")
          .eq("cv_id", cv_id)
          .maybeSingle()
        if (profileRow) cv_profile = profileRow as Record<string, unknown>

        console.log("CV Analyze: CV processed successfully", {
          cv_id,
          hasParsedData: !!parsed_data,
          hasProfile: !!cv_profile,
        })

        return NextResponse.json({
          success: true,
          status: "processed",
          parsed_data,
          cv_profile,
        })
      }
      if (status === "failed") {
        console.error("CV Analyze: CV analysis marked as failed in DB", { cv_id })
        return NextResponse.json({
          success: false,
          status: "failed",
          error: "CV analysis failed",
        })
      }

      await sleep(POLL_INTERVAL_MS)
    }

    console.error("CV Analyze: analysis timeout reached", { cv_id })
    return NextResponse.json(
      {
        success: false,
        error: "Analysis timeout. You can check the result later from your CV list.",
      },
      { status: 408 }
    )
  } catch (err: unknown) {
    console.error("CV analyze error", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
