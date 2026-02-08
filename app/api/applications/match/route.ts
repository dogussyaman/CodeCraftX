import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/** Turkish/English stopwords - short list to keep meaningful overlap */
const STOPWORDS = new Set(
  (
    "ve veya ile bir bu o da de ki için var mi mu mü mı mı dır dir ler lar " +
    "the a an and or but in on at to for of with by from as is was are were been be have has had do does did will would could should may might must can "
  ).split(/\s+/)
)

function normalizeTokenize(text: string): Set<string> {
  if (!text || typeof text !== "string") return new Set()
  const normalized = text
    .toLowerCase()
    .replace(/[\s\u00ad]+/g, " ")
    .trim()
  const words = normalized.split(/\s+/).filter((w) => w.length >= 2 && !STOPWORDS.has(w))
  return new Set(words)
}

/**
 * POST /api/applications/match
 * Body: { applicationId: string }
 * Analyzes full CV (about, experience, education, summary) vs job (title, description, requirements).
 * Score is based on text overlap and experience level fit, not only skills.
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

    // Job: title, description, requirements, responsibilities, experience_level
    const { data: job, error: jobError } = await supabase
      .from("job_postings")
      .select("id, title, description, requirements, responsibilities, experience_level")
      .eq("id", jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      )
    }

    const jobText = [
      job.title,
      job.description,
      job.requirements,
      job.responsibilities,
    ]
      .filter(Boolean)
      .join(" ")
    const jobWords = normalizeTokenize(jobText)

    // CV side: profile, cv_profiles, cvs.raw_text, experiences, educations
    const cvParts: string[] = []

    const { data: profile } = await supabase
      .from("profiles")
      .select("bio, title")
      .eq("id", developerId)
      .single()
    if (profile?.bio) cvParts.push(profile.bio)
    if (profile?.title) cvParts.push(profile.title)

    if (cvId) {
      const { data: cvRow } = await supabase
        .from("cvs")
        .select("raw_text")
        .eq("id", cvId)
        .single()
      if (cvRow?.raw_text) cvParts.push(cvRow.raw_text)

      const { data: cvProfile } = await supabase
        .from("cv_profiles")
        .select("summary, experience_years, roles, seniority, skills")
        .eq("cv_id", cvId)
        .maybeSingle()
      if (cvProfile) {
        if (cvProfile.summary) cvParts.push(cvProfile.summary)
        if (typeof cvProfile.experience_years === "number") {
          cvParts.push(`${cvProfile.experience_years} yıl deneyim`)
        }
        const roles = (cvProfile.roles as string[] | null) || []
        if (roles.length) cvParts.push(roles.join(" "))
        if (cvProfile.seniority) cvParts.push(cvProfile.seniority)
        const skills = (cvProfile.skills as string[] | null) || []
        if (skills.length) cvParts.push(skills.join(" "))
      }
    }

    const { data: experiences } = await supabase
      .from("experiences")
      .select("position, company_name, description")
      .eq("developer_id", developerId)
    for (const e of experiences || []) {
      cvParts.push(e.position || "", e.company_name || "", (e.description as string) || "")
    }

    const { data: educations } = await supabase
      .from("educations")
      .select("degree, field_of_study, school_name")
      .eq("developer_id", developerId)
    for (const ed of educations || []) {
      cvParts.push(ed.degree || "", ed.field_of_study || "", ed.school_name || "")
    }

    const cvText = cvParts.filter(Boolean).join(" ")
    const cvWords = normalizeTokenize(cvText)

    // Overlap: how many job keywords appear in CV
    let textScore = 0
    const matchedKeywords: string[] = []
    if (jobWords.size > 0) {
      for (const w of jobWords) {
        if (cvWords.has(w)) {
          matchedKeywords.push(w)
        }
      }
      textScore = Math.round((matchedKeywords.length / jobWords.size) * 100)
    }

    // Experience level fit (small bonus)
    let experienceNote = ""
    const jobLevel = (job as { experience_level?: string }).experience_level
    if (jobLevel && cvId) {
      const { data: cvProfile } = await supabase
        .from("cv_profiles")
        .select("seniority, experience_years")
        .eq("cv_id", cvId)
        .maybeSingle()
      const cvSeniority = (cvProfile as { seniority?: string } | null)?.seniority
      const cvYears = (cvProfile as { experience_years?: number } | null)?.experience_years ?? 0
      const levelOrder = { junior: 1, mid: 2, senior: 3, lead: 4 }
      const jOrder = levelOrder[jobLevel as keyof typeof levelOrder] ?? 0
      const cvOrder = cvSeniority ? (levelOrder[cvSeniority as keyof typeof levelOrder] ?? 0) : (cvYears >= 5 ? 3 : cvYears >= 2 ? 2 : 1)
      if (jOrder > 0 && cvOrder >= jOrder - 1) {
        // Skor zaten makulse "uyumlu" denir; düşük skorda tutarsız görünmesin
        if (textScore >= 20) {
          textScore = Math.min(100, textScore + 10)
          experienceNote = "Deneyim seviyesi ilanla uyumlu."
        }
      } else if (jOrder > 0 && cvOrder < jOrder - 1) {
        experienceNote = "Deneyim seviyesi ilandan daha düşük olabilir."
      }
    }

    const matchScore = Math.min(100, Math.max(0, textScore))

    let matchReason: string
    if (jobWords.size === 0) {
      matchReason = "İlan metninde anahtar ifade yok; genel uyum değerlendirildi."
    } else if (matchedKeywords.length === 0 && !experienceNote) {
      matchReason = "CV (hakkımda, deneyim, eğitim) ile ilan metni arasında sınırlı kelime örtüşmesi var."
    } else {
      const parts: string[] = []
      if (matchedKeywords.length > 0) {
        parts.push(`İlan metnindeki ${matchedKeywords.length} anahtar ifade CV'de (özgeçmiş, hakkımda, deneyim) geçiyor.`)
      }
      if (experienceNote) parts.push(experienceNote)
      matchReason = parts.join(" ")
    }

    const matchDetails = {
      matching_skills: matchedKeywords.slice(0, 20),
      missing_skills: [] as string[],
      missing_optional: [] as string[],
      note: "Skor CV metni (hakkımda, deneyim, eğitim, özet) ile ilan metninin uyumuna göre hesaplandı.",
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
