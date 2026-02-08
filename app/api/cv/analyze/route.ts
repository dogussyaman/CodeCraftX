import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const POLL_INTERVAL_MS = 2000
const MAX_WAIT_MS = 90_000

/**
 * POST /api/cv/analyze
 * Body: { cv_id: string }
 * Triggers cv-process Edge Function, then polls cvs.status until processed/failed. Returns parsed_data and cv_profile.
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
      .select("id, developer_id")
      .eq("id", cv_id)
      .single()

    if (fetchError || !cvRow) {
      return NextResponse.json(
        { success: false, error: "CV not found" },
        { status: 404 }
      )
    }

    if ((cvRow as { developer_id: string }).developer_id !== user.id) {
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

    const invokeRes = await fetch(`${url}/functions/v1/cv-process`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cv_id }),
    })

    if (!invokeRes.ok) {
      const errText = await invokeRes.text()
      console.error("cv-process invoke error", invokeRes.status, errText)
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
      if (status === "processed") {
        const parsed_data = (cv as { parsed_data?: Record<string, unknown> }).parsed_data ?? null
        let cv_profile: Record<string, unknown> | null = null
        const { data: profileRow } = await supabase
          .from("cv_profiles")
          .select("skills, experience_years, roles, seniority, summary")
          .eq("cv_id", cv_id)
          .maybeSingle()
        if (profileRow) cv_profile = profileRow as Record<string, unknown>

        return NextResponse.json({
          success: true,
          status: "processed",
          parsed_data,
          cv_profile,
        })
      }
      if (status === "failed") {
        return NextResponse.json({
          success: false,
          status: "failed",
          error: "CV analysis failed",
        })
      }

      await sleep(POLL_INTERVAL_MS)
    }

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
