import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { computeSemanticScoreForApplication } from "@/lib/ats/semantic"

export async function POST(req: NextRequest) {
  try {
    const { applicationId, cvId, jobId } = (await req.json()) as {
      applicationId?: string
      cvId?: string
      jobId?: string
    }

    if (!applicationId && !(cvId && jobId)) {
      return NextResponse.json(
        { success: false, error: "applicationId veya (cvId + jobId) gereklidir" },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      )
    }

    let resolvedCvId = cvId ?? null
    let resolvedJobId = jobId ?? null

    if (applicationId) {
      const { data: app, error: appError } = await supabase
        .from("applications")
        .select("id, job_id, developer_id, cv_id")
        .eq("id", applicationId)
        .single()

      if (appError || !app) {
        return NextResponse.json(
          { success: false, error: "Application not found" },
          { status: 404 },
        )
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, company_id")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError || !profile) {
        return NextResponse.json(
          { success: false, error: "Profile not found" },
          { status: 403 },
        )
      }

      const { data: job } = await supabase
        .from("job_postings")
        .select("company_id")
        .eq("id", app.job_id)
        .maybeSingle()

      const isOwnerDeveloper = app.developer_id === user.id
      const isCompanyUser =
        job &&
        profile.company_id &&
        job.company_id === profile.company_id &&
        ["hr", "admin", "company_admin", "platform_admin"].includes(profile.role)

      if (!isOwnerDeveloper && !isCompanyUser) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        )
      }

      resolvedCvId = (app.cv_id as string | null) ?? resolvedCvId
      resolvedJobId = (app.job_id as string) ?? resolvedJobId
    }

    if (!resolvedJobId) {
      return NextResponse.json(
        { success: false, error: "jobId could not be resolved" },
        { status: 400 },
      )
    }

    const result = await computeSemanticScoreForApplication({
      applicationId: applicationId ?? "ad-hoc",
      cvId: resolvedCvId,
      jobId: resolvedJobId,
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (err: unknown) {
    console.error("ATS semantic-match error", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

