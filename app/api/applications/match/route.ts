import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * POST /api/applications/match
 * Body: { applicationId: string }
 * Computes match_score and match_reason for an application (job skills vs developer/CV skills).
 */
export async function POST(req: NextRequest) {
  try {
    const { applicationId } = (await req.json()) as { applicationId?: string }
    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "applicationId is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("id, job_id, developer_id, cv_id")
      .eq("id", applicationId)
      .single()

    if (appError || !application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      )
    }

    const jobId = application.job_id
    const developerId = application.developer_id
    const cvId = application.cv_id

    // Job skills (with names)
    const { data: jobSkills } = await supabase
      .from("job_skills")
      .select("skill_id, is_required, skills:skill_id(name)")
      .eq("job_id", jobId)

    const jobRequiredNames = new Set<string>()
    const jobOptionalNames = new Set<string>()
    for (const row of jobSkills || []) {
      const name = (row.skills as { name?: string } | null)?.name
      if (!name) continue
      const isRequired = (row as { is_required?: boolean }).is_required
      if (isRequired !== false) {
        jobRequiredNames.add(name)
      } else {
        jobOptionalNames.add(name)
      }
    }

    // Developer skills: developer_skills + cv_profiles (for this cv)
    const devSkillNames = new Set<string>()

    const { data: devSkills } = await supabase
      .from("developer_skills")
      .select("skill_id, skills:skill_id(name)")
      .eq("developer_id", developerId)
    for (const row of devSkills || []) {
      const name = (row.skills as { name?: string } | null)?.name
      if (name) devSkillNames.add(name)
    }

    if (cvId) {
      const { data: cvProfile } = await supabase
        .from("cv_profiles")
        .select("skills")
        .eq("cv_id", cvId)
        .maybeSingle()
      const cvSkills = (cvProfile?.skills as string[] | null) || []
      cvSkills.forEach((s: string) => devSkillNames.add(s))
    }

    const requiredList = Array.from(jobRequiredNames)
    const optionalList = Array.from(jobOptionalNames)
    const matchingRequired = requiredList.filter((s) => devSkillNames.has(s))
    const matchingOptional = optionalList.filter((s) => devSkillNames.has(s))
    const missingRequired = requiredList.filter((s) => !devSkillNames.has(s))
    const missingOptional = optionalList.filter((s) => !devSkillNames.has(s))

    const totalWeight = requiredList.length * 2 + optionalList.length || 1
    const scoreWeight = matchingRequired.length * 2 + matchingOptional.length
    const matchScore = Math.round(Math.min(100, Math.max(0, (scoreWeight / totalWeight) * 100)))

    const reasonParts: string[] = []
    if (matchingRequired.length > 0) {
      reasonParts.push(
        `${matchingRequired.length}/${requiredList.length} zorunlu yetenek eşleşti`
      )
    }
    if (optionalList.length > 0) {
      reasonParts.push(
        `${matchingOptional.length}/${optionalList.length} tercih yeteneği eşleşti`
      )
    }
    const matchReason =
      reasonParts.length > 0
        ? reasonParts.join(". ")
        : requiredList.length === 0 && optionalList.length === 0
          ? "İlan için yetenek tanımı yok."
          : "Yetenek eşleşmesi düşük."

    const matchDetails = {
      matching_skills: [...matchingRequired, ...matchingOptional],
      missing_skills: [...missingRequired],
      missing_optional: missingOptional,
    }

    const { error: updateError } = await supabase
      .from("applications")
      .update({
        match_score: matchScore,
        match_reason: matchReason,
        match_details: matchDetails,
      })
      .eq("id", applicationId)

    if (updateError) {
      console.error("Application match update error", updateError)
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      match_score: matchScore,
      match_reason: matchReason,
      match_details: matchDetails,
    })
  } catch (err: unknown) {
    console.error("Application match error", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
