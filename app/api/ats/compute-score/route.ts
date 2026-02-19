import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { computeATSScore } from "@/lib/ats/service"
import type { ScoringBreakdown } from "@/lib/ats/types"

/** Map full ATS breakdown to UI MatchDetails shape (same as legacy /api/applications/match). */
function breakdownToMatchDetails(breakdown: ScoringBreakdown) {
  const skill = breakdown.components.skill
  const exp = breakdown.components.experience
  const edu = breakdown.components.education
  return {
    matching_skills: skill?.matching ?? [],
    missing_skills: skill?.missing_required ?? [],
    missing_optional: skill?.missing_optional ?? [],
    positive_factors: breakdown.positive_factors ?? [],
    negative_factors: breakdown.negative_factors ?? [],
    experience_analysis:
      exp != null
        ? {
            candidate_years: exp.candidate_years ?? 0,
            required_level: exp.required_level ?? "",
            candidate_level: exp.candidate_level ?? "",
            level_match: exp.meets ?? false,
            note: "",
          }
        : null,
    education_match:
      edu != null
        ? {
            relevant: edu.field_relevant ?? false,
            degree_level: edu.degree ?? "Belirtilmemiş",
            field_relevance: edu.field_relevant ? "İlgili" : "Farklı alan",
          }
        : null,
  }
}

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

    const finalScore = breakdown.final_score
    const matchReason =
      finalScore >= 80
        ? "Aday, ATS skoruna göre pozisyon için çok güçlü bir eşleşme."
        : finalScore >= 60
          ? "Aday, ATS skoruna göre pozisyon için uygun bir eşleşme."
          : "Aday, ATS skoruna göre pozisyon gereksinimleriyle sınırlı uyum gösteriyor."
    const match_details = breakdownToMatchDetails(breakdown)

    return NextResponse.json({
      success: true,
      match_score: finalScore,
      match_reason: matchReason,
      match_details,
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

