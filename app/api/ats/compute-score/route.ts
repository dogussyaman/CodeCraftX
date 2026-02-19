import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { computeATSScore } from "@/lib/ats/service"

export async function POST(req: NextRequest) {
  try {
    const { applicationId, forceRecalculate, algorithmVersion } = (await req.json()) as {
      applicationId?: string
      forceRecalculate?: boolean
      algorithmVersion?: string
    }

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "applicationId is required" },
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

    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(
        `
        id,
        job_id,
        developer_id
      `,
      )
      .eq("id", applicationId)
      .single()

    if (appError || !application) {
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

    const isOwnerDeveloper = application.developer_id === user.id

    const { data: job } = await supabase
      .from("job_postings")
      .select("company_id, created_by")
      .eq("id", application.job_id)
      .maybeSingle()

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

    const { atsScore, breakdown } = await computeATSScore(applicationId, {
      forceRecalculate,
      algorithmVersion,
    })

    return NextResponse.json({
      success: true,
      data: {
        ats_score: atsScore,
        scoring_breakdown: breakdown,
      },
    })
  } catch (err: unknown) {
    console.error("ATS compute-score error", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

