import { createAdminClient } from "@/lib/supabase/admin"
import type { AlgorithmWeights, RuleScoreComponents, ScoringBreakdown } from "./types"

function clamp(value: number, min = 0, max = 100): number {
  if (!Number.isFinite(value)) return min
  return Math.max(min, Math.min(max, Math.round(value)))
}

async function loadAlgorithmWeights(): Promise<AlgorithmWeights> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from("scoring_algorithm_versions")
    .select("weights")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data || !data.weights) {
    return {
      rule_weight: 0.6,
      semantic_weight: 0.4,
      skill_weight: 0.5,
      experience_weight: 0.25,
      education_weight: 0.15,
      optional_bonus_weight: 0.1,
    }
  }

  const w = data.weights as Partial<AlgorithmWeights>
  return {
    rule_weight: w.rule_weight ?? 0.6,
    semantic_weight: w.semantic_weight ?? 0.4,
    skill_weight: w.skill_weight ?? 0.5,
    experience_weight: w.experience_weight ?? 0.25,
    education_weight: w.education_weight ?? 0.15,
    optional_bonus_weight: w.optional_bonus_weight ?? 0.1,
  }
}

interface RuleInputs {
  jobId: string
  developerId: string
  cvId: string | null
}

interface RuleOutput {
  ruleScore: number
  components: RuleScoreComponents
  positiveFactors: string[]
  negativeFactors: string[]
}

export async function computeRuleScore(inputs: RuleInputs): Promise<RuleOutput> {
  const admin = createAdminClient()
  const weights = await loadAlgorithmWeights()

  const positiveFactors: string[] = []
  const negativeFactors: string[] = []

  const { data: job, error: jobError } = await admin
    .from("job_postings")
    .select(
      `
      id,
      title,
      description,
      requirements,
      responsibilities,
      experience_level,
      min_experience_years,
      education_requirement,
      seniority_requirement
    `,
    )
    .eq("id", inputs.jobId)
    .single()

  if (jobError || !job) {
    throw new Error("Job not found for rule-based scoring")
  }

  const { data: jobSkills } = await admin
    .from("job_skills")
    .select(
      `
      is_required,
      proficiency_level,
      skills:skill_id ( name )
    `,
    )
    .eq("job_id", inputs.jobId)

  const requiredSkills: string[] = []
  const optionalSkills: string[] = []
  for (const js of jobSkills || []) {
    const skillName = (js.skills as { name?: string } | null)?.name
    if (!skillName) continue
    if (js.is_required) requiredSkills.push(skillName.toLowerCase())
    else optionalSkills.push(skillName.toLowerCase())
  }

  const { data: devSkills } = await admin
    .from("developer_skills")
    .select(`proficiency_level, skills:skill_id ( name )`)
    .eq("developer_id", inputs.developerId)

  const developerSkillNames = new Set(
    (devSkills || [])
      .map((ds) => (ds.skills as { name?: string } | null)?.name?.toLowerCase())
      .filter(Boolean) as string[],
  )

  let cvSkills: string[] = []
  if (inputs.cvId) {
    const { data: cvProfile } = await admin
      .from("cv_profiles")
      .select("skills")
      .eq("cv_id", inputs.cvId)
      .maybeSingle()
    if (cvProfile?.skills) {
      cvSkills = (cvProfile.skills as string[]).map((s) => s.toLowerCase())
    }
  }

  const allCandidateSkills = new Set([...developerSkillNames, ...cvSkills])
  const matchingSkills: string[] = []
  const missingRequiredSkills: string[] = []
  const missingOptionalSkills: string[] = []

  for (const skill of requiredSkills) {
    if (allCandidateSkills.has(skill)) matchingSkills.push(skill)
    else missingRequiredSkills.push(skill)
  }

  for (const skill of optionalSkills) {
    if (allCandidateSkills.has(skill)) matchingSkills.push(skill)
    else missingOptionalSkills.push(skill)
  }

  let skillScore = 0
  if (requiredSkills.length > 0) {
    const requiredMatchCount = matchingSkills.filter((s) => requiredSkills.includes(s)).length
    const requiredMatchRate = requiredMatchCount / requiredSkills.length
    const optionalMatchCount = matchingSkills.filter((s) => optionalSkills.includes(s)).length
    const optionalMatchRate = optionalSkills.length > 0 ? optionalMatchCount / optionalSkills.length : 0
    const optionalBonus = optionalMatchRate * 0.2
    skillScore = clamp((requiredMatchRate + optionalBonus) * 100)

    if (requiredMatchRate >= 0.8) {
      positiveFactors.push(`Gerekli yeteneklerin %${Math.round(requiredMatchRate * 100)}'i mevcut`)
    } else if (requiredMatchRate < 0.5) {
      negativeFactors.push(`Gerekli yeteneklerin %${Math.round((1 - requiredMatchRate) * 100)}'i eksik`)
    }
  } else {
    skillScore = allCandidateSkills.size > 0 ? 70 : 30
  }

  const { data: cvProfile } = await admin
    .from("cv_profiles")
    .select("experience_years, seniority, education_level")
    .eq("cv_id", inputs.cvId)
    .maybeSingle()

  const candidateYears = (cvProfile?.experience_years as number | null) ?? null
  const candidateSeniority = (cvProfile?.seniority as string | null) ?? null
  const candidateEducation = (cvProfile?.education_level as string | null) ?? null

  const levelOrder: Record<string, number> = { junior: 1, mid: 2, senior: 3, lead: 4 }

  const jobLevel = (job.experience_level as string | null) ?? null
  const jobLevelOrder = jobLevel ? levelOrder[jobLevel] ?? 0 : 0

  let experienceScore = 0
  let experienceMeets: boolean | null = null
  let candidateLevelLabel: string | null = null

  if (jobLevel || job.min_experience_years != null) {
    const inferredOrder =
      candidateSeniority != null
        ? levelOrder[candidateSeniority] ?? 0
        : candidateYears != null
          ? candidateYears >= 5
            ? levelOrder.senior
            : candidateYears >= 2
              ? levelOrder.mid
              : levelOrder.junior
          : 0

    candidateLevelLabel =
      candidateSeniority ??
      (candidateYears != null
        ? `${candidateYears} yıl`
        : null)

    const meetsLevel = jobLevelOrder === 0 || inferredOrder >= jobLevelOrder
    const meetsYears =
      job.min_experience_years == null ||
      (candidateYears != null && candidateYears >= job.min_experience_years)

    experienceMeets = meetsLevel && meetsYears

    if (experienceMeets) {
      experienceScore = 100
      positiveFactors.push("Deneyim seviyesi ve yıl gereksinimleriyle uyumlu")
    } else if (inferredOrder === jobLevelOrder - 1 || (candidateYears != null && job.min_experience_years != null && candidateYears + 1 >= job.min_experience_years)) {
      experienceScore = 75
      positiveFactors.push("Deneyim seviyesi pozisyona yakın, gelişime açık")
    } else {
      experienceScore = 40
      negativeFactors.push("Deneyim seviyesi pozisyon gereksinimlerinin altında")
    }
  } else {
    experienceScore = 50
  }

  const { data: educations } = await admin
    .from("educations")
    .select("degree, field_of_study")
    .eq("developer_id", inputs.developerId)
    .order("end_date", { ascending: false })

  let educationScore = 0
  let requiredEdu: string | null = (job.education_requirement as string | null) ?? null
  let candidateEdu: string | null = candidateEducation
  let fieldRelevant: boolean | null = null
  let degreeLabel: string | null = null

  if (educations && educations.length > 0) {
    const highestEd = educations[0] as { degree?: string | null; field_of_study?: string | null }
    degreeLabel = highestEd.degree ?? null
    const field = highestEd.field_of_study?.toLowerCase() ?? ""
    const jobTextLower = (
      [
        job.title,
        job.description,
        job.requirements,
        job.responsibilities,
      ]
        .filter(Boolean)
        .join(" ") as string
    ).toLowerCase()

    fieldRelevant =
      jobTextLower.includes(field) ||
      field.includes("bilgisayar") ||
      field.includes("yazılım") ||
      field.includes("computer") ||
      field.includes("software")

    if (!requiredEdu || requiredEdu === "any") {
      educationScore = fieldRelevant ? 80 : 60
    } else {
      const ladder: Record<string, number> = {
        high_school: 1,
        associate: 2,
        bachelor: 3,
        master: 4,
        phd: 5,
      }
      const reqOrder = ladder[requiredEdu] ?? 0
      const candOrder = candidateEdu && ladder[candidateEdu] ? ladder[candidateEdu] : 0
      if (candOrder >= reqOrder && fieldRelevant) {
        educationScore = 100
        positiveFactors.push("Eğitim seviyesi ve alanı pozisyonla uyumlu")
      } else if (candOrder >= reqOrder) {
        educationScore = 80
        positiveFactors.push("Eğitim seviyesi yeterli, alan farklı")
      } else if (candOrder === reqOrder - 1) {
        educationScore = 60
        negativeFactors.push("Eğitim seviyesi hafif altında, alan kısmen uyumlu")
      } else {
        educationScore = 40
        negativeFactors.push("Eğitim seviyesi pozisyon gereksinimlerinin altında")
      }
    }
  } else {
    educationScore = 30
    negativeFactors.push("Eğitim bilgisi eksik")
  }

  const optionalBonusScore =
    missingOptionalSkills.length < optionalSkills.length && optionalSkills.length > 0
      ? clamp((optionalSkills.length - missingOptionalSkills.length) / optionalSkills.length * 100)
      : 0

  const skillWeighted = (skillScore * weights.skill_weight) / (weights.skill_weight + weights.experience_weight + weights.education_weight + weights.optional_bonus_weight)
  const experienceWeighted = (experienceScore * weights.experience_weight) / (weights.skill_weight + weights.experience_weight + weights.education_weight + weights.optional_bonus_weight)
  const educationWeighted = (educationScore * weights.education_weight) / (weights.skill_weight + weights.experience_weight + weights.education_weight + weights.optional_bonus_weight)
  const optionalWeighted = (optionalBonusScore * weights.optional_bonus_weight) / (weights.skill_weight + weights.experience_weight + weights.education_weight + weights.optional_bonus_weight)

  const ruleScore = clamp(skillWeighted + experienceWeighted + educationWeighted + optionalWeighted)

  const components: RuleScoreComponents = {
    skill: {
      score: skillScore,
      weight: weights.skill_weight,
      weighted: skillWeighted,
      required_matched: requiredSkills.length - missingRequiredSkills.length,
      required_total: requiredSkills.length,
      optional_matched: optionalSkills.length - missingOptionalSkills.length,
      optional_total: optionalSkills.length,
      matching: matchingSkills,
      missing_required: missingRequiredSkills,
      missing_optional: missingOptionalSkills,
    },
    experience: {
      score: experienceScore,
      weight: weights.experience_weight,
      weighted: experienceWeighted,
      required_years: job.min_experience_years ?? null,
      candidate_years: candidateYears,
      required_level: job.experience_level ?? null,
      candidate_level: candidateLevelLabel,
      meets: experienceMeets,
    },
    education: {
      score: educationScore,
      weight: weights.education_weight,
      weighted: educationWeighted,
      required: (requiredEdu as any) ?? null,
      candidate: (candidateEdu as any) ?? null,
      field_relevant: fieldRelevant,
      degree: degreeLabel,
    },
    optional_bonus: {
      score: optionalBonusScore,
      weight: weights.optional_bonus_weight,
      weighted: optionalWeighted,
    },
  }

  return {
    ruleScore,
    components,
    positiveFactors,
    negativeFactors,
  }
}

export function buildScoringBreakdown(params: {
  algorithmVersion: string
  ruleScore: number
  semanticScore: number
  weights: AlgorithmWeights
  components: RuleScoreComponents
  semanticComponent: ScoringBreakdown["semantic"]
  positiveFactors: string[]
  negativeFactors: string[]
}): ScoringBreakdown {
  const { algorithmVersion, ruleScore, semanticScore, weights, components, semanticComponent, positiveFactors, negativeFactors } =
    params

  const finalScore = clamp(ruleScore * weights.rule_weight + semanticScore * weights.semantic_weight)

  return {
    algorithm_version: algorithmVersion,
    rule_score: ruleScore,
    semantic_score: semanticScore,
    final_score: finalScore,
    components,
    semantic: semanticComponent,
    positive_factors: positiveFactors,
    negative_factors: negativeFactors,
    calculated_at: new Date().toISOString(),
  }
}

