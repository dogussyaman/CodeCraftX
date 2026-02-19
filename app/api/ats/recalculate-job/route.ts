import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { recalculateJobScores } from "@/lib/ats/service"

export async function POST(req: NextRequest) {
  try {
    const { jobId, algorithmVersion, batchSize } = (await req.json()) as {
      jobId?: string
      algorithmVersion?: string
      batchSize?: number
    }

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "jobId is required" },
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

    const { data: job, error: jobError } = await supabase
      .from("job_postings")
      .select("id, company_id")
      .eq("id", jobId)
      .maybeSingle()

    if (jobError || !job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 },
      )
    }

    const isCompanyUser =
      profile.company_id &&
      profile.company_id === job.company_id &&
      ["hr", "admin", "company_admin", "platform_admin"].includes(profile.role)

    if (!isCompanyUser) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      )
    }

    const started = Date.now()
    const { processed, errors } = await recalculateJobScores(jobId, {
      algorithmVersion,
      batchSize,
    })
    const durationMs = Date.now() - started

    return NextResponse.json({
      success: true,
      data: {
        processed_count: processed.length,
        error_count: errors.length,
        errors,
        duration_ms: durationMs,
      },
    })
  } catch (err: unknown) {
    console.error("ATS recalculate-job error", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

