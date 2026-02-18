import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { applicationId, jobId, developerId } = (await req.json()) as {
      applicationId?: string
      jobId?: string
      developerId?: string
    }

    if (!applicationId && (!jobId || !developerId)) {
      return NextResponse.json(
        { success: false, error: "applicationId veya (jobId + developerId) zorunludur" },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    let resolvedJobId = jobId
    let resolvedDeveloperId = developerId
    let matchScore = 0
    let matchDetails: any = null

    if (applicationId) {
      const { data: app, error: appError } = await supabase
        .from("applications")
        .select("job_id, developer_id, match_score, match_details")
        .eq("id", applicationId)
        .single()

      if (appError || !app) {
        return NextResponse.json({ success: false, error: "Başvuru bulunamadı" }, { status: 404 })
      }

      resolvedJobId = app.job_id as string
      resolvedDeveloperId = app.developer_id as string
      matchScore = (app.match_score as number | null) ?? 0
      matchDetails = app.match_details
    }

    if (!resolvedJobId || !resolvedDeveloperId) {
      return NextResponse.json(
        { success: false, error: "jobId veya developerId çözümlenemedi" },
        { status: 400 },
      )
    }

    const { error: upsertError } = await supabase
      .from("matches")
      .upsert(
        {
          job_id: resolvedJobId,
          developer_id: resolvedDeveloperId,
          match_score: matchScore,
          matching_skills: (matchDetails as any)?.matching_skills || [],
          missing_skills: (matchDetails as any)?.missing_skills || [],
          status: "suggested",
        },
        { onConflict: "job_id,developer_id" },
      )

    if (upsertError) {
      console.error("add-to-matches upsert error", upsertError)
      return NextResponse.json(
        { success: false, error: upsertError.message ?? "Eşleşmelere eklenirken hata oluştu" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      job_id: resolvedJobId,
      developer_id: resolvedDeveloperId,
      match_score: matchScore,
    })
  } catch (err: unknown) {
    console.error("add-to-matches error", err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Bilinmeyen hata" },
      { status: 500 },
    )
  }
}

