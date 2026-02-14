import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/** Turkish/English stopwords - short list to keep meaningful overlap */
const STOPWORDS = new Set(
  (
    "ve veya ile bir bu o da de ki için var mi mu mü mı mı dır dir ler lar " +
    "the a an and or but in on at to for of with by from as is was are were been be have has had do does did will would could should may might must can "
  ).split(/\s+/)
)

/** Technology terms get higher weight in text matching */
const TECH_TERMS = new Set([
  "react", "vue", "angular", "node", "nodejs", "python", "java", "javascript", "typescript",
  "docker", "kubernetes", "aws", "azure", "gcp", "sql", "nosql", "mongodb", "postgresql",
  "git", "ci/cd", "agile", "scrum", "api", "rest", "graphql", "microservices",
  "frontend", "backend", "fullstack", "full-stack", "devops", "ml", "ai"
])

function normalizeTokenize(text: string): Set<string> {
  if (!text || typeof text !== "string") return new Set()
  const normalized = text
    .toLowerCase()
    .replace(/[\s\u00ad]+/g, " ")
    .trim()
  const words = normalized.split(/\s+/).filter((w) => w.length >= 2 && !STOPWORDS.has(w))
  return new Set(words)
}

interface MatchDetails {
  matching_skills: string[]
  missing_skills: string[]
  missing_optional: string[]
  positive_factors: string[]
  negative_factors: string[]
  experience_analysis: {
    candidate_years: number
    required_level: string
    candidate_level: string
    level_match: boolean
    note: string
  } | null
  education_match: {
    relevant: boolean
    degree_level: string
    field_relevance: string
  } | null
}

/**
 * POST /api/applications/match
 * Body: { applicationId: string }
 * Multi-layered matching analysis:
 * - Skill matching (40%)
 * - Experience level fit (25%)
 * - Text relevance (25%)
 * - Education match (10%)
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

    // Get application
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

    const { job_id: jobId, developer_id: developerId, cv_id: cvId } = application

    // Get job details
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

    // Initialize scoring components
    let skillScore = 0
    let experienceScore = 0
    let textScore = 0
    let educationScore = 0

    const positiveFactor: string[] = []
    const negativeFactor: string[] = []

    // ============================================
    // 1. SKILL MATCHING (40% weight)
    // ============================================
    const { data: jobSkills } = await supabase
      .from("job_skills")
      .select(`
        is_required,
        proficiency_level,
        skills:skill_id (
          id,
          name
        )
      `)
      .eq("job_id", jobId)

    const requiredSkills: string[] = []
    const optionalSkills: string[] = []

    for (const js of jobSkills || []) {
      const skillName = (js.skills as any)?.name
      if (!skillName) continue
      if (js.is_required) {
        requiredSkills.push(skillName.toLowerCase())
      } else {
        optionalSkills.push(skillName.toLowerCase())
      }
    }

    // Get developer skills
    const { data: devSkills } = await supabase
      .from("developer_skills")
      .select(`
        proficiency_level,
        skills:skill_id (
          name
        )
      `)
      .eq("developer_id", developerId)

    const developerSkillNames = new Set(
      (devSkills || []).map((ds) => (ds.skills as any)?.name?.toLowerCase()).filter(Boolean)
    )

    // Also get skills from CV profile
    let cvSkills: string[] = []
    if (cvId) {
      const { data: cvProfile } = await supabase
        .from("cv_profiles")
        .select("skills")
        .eq("cv_id", cvId)
        .maybeSingle()

      if (cvProfile?.skills) {
        cvSkills = (cvProfile.skills as string[]).map(s => s.toLowerCase())
      }
    }

    const allCandidateSkills = new Set([...developerSkillNames, ...cvSkills])

    const matchingSkills: string[] = []
    const missingRequiredSkills: string[] = []
    const missingOptionalSkills: string[] = []

    // Check required skills
    for (const skill of requiredSkills) {
      if (allCandidateSkills.has(skill)) {
        matchingSkills.push(skill)
      } else {
        missingRequiredSkills.push(skill)
      }
    }

    // Check optional skills
    for (const skill of optionalSkills) {
      if (allCandidateSkills.has(skill)) {
        matchingSkills.push(skill)
      } else {
        missingOptionalSkills.push(skill)
      }
    }

    // Calculate skill score
    if (requiredSkills.length > 0) {
      const requiredMatchRate = matchingSkills.filter(s => requiredSkills.includes(s)).length / requiredSkills.length
      const optionalBonus = optionalSkills.length > 0
        ? (matchingSkills.filter(s => optionalSkills.includes(s)).length / optionalSkills.length) * 0.2
        : 0

      skillScore = Math.round((requiredMatchRate + optionalBonus) * 100)

      if (requiredMatchRate >= 0.8) {
        positiveFactor.push(`Gerekli yeteneklerin %${Math.round(requiredMatchRate * 100)}'i mevcut`)
      } else if (requiredMatchRate < 0.5) {
        negativeFactor.push(`Gerekli yeteneklerin %${Math.round((1 - requiredMatchRate) * 100)}'i eksik`)
      }
    } else {
      // No specific skills defined, use general skill presence
      skillScore = allCandidateSkills.size > 0 ? 70 : 30
    }

    // ============================================
    // 2. EXPERIENCE LEVEL MATCHING (25% weight)
    // ============================================
    let experienceAnalysis: MatchDetails["experience_analysis"] = null
    const jobLevel = job.experience_level

    if (jobLevel && cvId) {
      const { data: cvProfile } = await supabase
        .from("cv_profiles")
        .select("seniority, experience_years")
        .eq("cv_id", cvId)
        .maybeSingle()

      const cvSeniority = cvProfile?.seniority
      const cvYears = cvProfile?.experience_years ?? 0

      const levelOrder = { junior: 1, mid: 2, senior: 3, lead: 4 }
      const jOrder = levelOrder[jobLevel as keyof typeof levelOrder] ?? 0
      const cvOrder = cvSeniority
        ? (levelOrder[cvSeniority as keyof typeof levelOrder] ?? 0)
        : (cvYears >= 5 ? 3 : cvYears >= 2 ? 2 : 1)

      let levelMatch = false
      let note = ""

      if (cvOrder >= jOrder) {
        levelMatch = true
        experienceScore = 100
        note = "Deneyim seviyesi pozisyon gereksinimleriyle uyumlu"
        positiveFactor.push(note)
      } else if (cvOrder === jOrder - 1) {
        levelMatch = true
        experienceScore = 75
        note = "Deneyim seviyesi pozisyona yakın, gelişime açık"
        positiveFactor.push(note)
      } else {
        levelMatch = false
        experienceScore = 40
        note = "Deneyim seviyesi pozisyon gereksinimlerinin altında"
        negativeFactor.push(note)
      }

      experienceAnalysis = {
        candidate_years: cvYears,
        required_level: jobLevel,
        candidate_level: cvSeniority || `${cvYears} yıl`,
        level_match: levelMatch,
        note
      }
    } else {
      // No experience level specified or no CV
      experienceScore = 50
    }

    // ============================================
    // 3. TEXT RELEVANCE MATCHING (25% weight)
    // ============================================
    const jobText = [
      job.title,
      job.description,
      job.requirements,
      job.responsibilities,
    ]
      .filter(Boolean)
      .join(" ")
    const jobWords = normalizeTokenize(jobText)

    // Collect CV text
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
        .select("summary, roles")
        .eq("cv_id", cvId)
        .maybeSingle()

      if (cvProfile) {
        if (cvProfile.summary) cvParts.push(cvProfile.summary)
        const roles = (cvProfile.roles as string[] | null) || []
        if (roles.length) cvParts.push(roles.join(" "))
      }
    }

    const { data: experiences } = await supabase
      .from("experiences")
      .select("position, company_name, description")
      .eq("developer_id", developerId)

    for (const e of experiences || []) {
      cvParts.push(e.position || "", e.company_name || "", (e.description as string) || "")
    }

    const cvText = cvParts.filter(Boolean).join(" ")
    const cvWords = normalizeTokenize(cvText)

    // Calculate text overlap with tech term weighting
    let matchedKeywords: string[] = []
    let techTermMatches = 0

    if (jobWords.size > 0) {
      for (const word of jobWords) {
        if (cvWords.has(word)) {
          matchedKeywords.push(word)
          if (TECH_TERMS.has(word)) {
            techTermMatches++
          }
        }
      }

      const baseOverlap = matchedKeywords.length / jobWords.size
      const techBonus = techTermMatches > 0 ? 0.1 : 0
      textScore = Math.round((baseOverlap + techBonus) * 100)

      if (textScore >= 60) {
        positiveFactor.push(`CV içeriği iş tanımıyla %${textScore} oranında örtüşüyor`)
      } else if (textScore < 30) {
        negativeFactor.push("CV içeriği ile iş tanımı arasında düşük örtüşme")
      }
    }

    // ============================================
    // 4. EDUCATION MATCHING (10% weight)
    // ============================================
    let educationMatch: MatchDetails["education_match"] = null

    const { data: educations } = await supabase
      .from("educations")
      .select("degree, field_of_study")
      .eq("developer_id", developerId)
      .order("end_date", { ascending: false })

    if (educations && educations.length > 0) {
      const highestEd = educations[0]
      const degree = highestEd.degree?.toLowerCase() || ""
      const field = highestEd.field_of_study?.toLowerCase() || ""

      // Check if field is relevant to job
      const jobTextLower = jobText.toLowerCase()
      const fieldRelevant = jobTextLower.includes(field) || field.includes("bilgisayar") || field.includes("yazılım") || field.includes("computer") || field.includes("software")

      if (fieldRelevant) {
        educationScore = 100
        positiveFactor.push("Eğitim alanı pozisyonla ilgili")
      } else {
        educationScore = 50
      }

      educationMatch = {
        relevant: fieldRelevant,
        degree_level: highestEd.degree || "Belirtilmemiş",
        field_relevance: fieldRelevant ? "İlgili" : "Farklı alan"
      }
    } else {
      educationScore = 30
      negativeFactor.push("Eğitim bilgisi eksik")
    }

    // ============================================
    // FINAL SCORE CALCULATION
    // ============================================
    const finalScore = Math.round(
      skillScore * 0.4 +
      experienceScore * 0.25 +
      textScore * 0.25 +
      educationScore * 0.1
    )

    // Generate match reason
    let matchReason = ""
    if (finalScore >= 80) {
      matchReason = "Aday, pozisyon gereksinimleriyle yüksek oranda uyumlu. "
    } else if (finalScore >= 60) {
      matchReason = "Aday, pozisyon için uygun görünüyor. "
    } else if (finalScore >= 40) {
      matchReason = "Aday, bazı gereksinimleri karşılıyor ancak eksiklikler var. "
    } else {
      matchReason = "Aday, pozisyon gereksinimleriyle düşük uyumlu. "
    }

    if (matchingSkills.length > 0) {
      matchReason += `${matchingSkills.length} yetenek eşleşmesi bulundu. `
    }
    if (experienceAnalysis?.level_match) {
      matchReason += "Deneyim seviyesi uygun. "
    }

    const matchDetails: MatchDetails = {
      matching_skills: matchingSkills,
      missing_skills: missingRequiredSkills,
      missing_optional: missingOptionalSkills,
      positive_factors: positiveFactor,
      negative_factors: negativeFactor,
      experience_analysis: experienceAnalysis,
      education_match: educationMatch,
    }

    // Update application
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        match_score: finalScore,
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
      match_score: finalScore,
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
