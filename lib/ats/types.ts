export type EducationLevel =
  | "high_school"
  | "associate"
  | "bachelor"
  | "master"
  | "phd"
  | "bootcamp"
  | "self_taught"
  | "other"

export type EducationRequirement =
  | "high_school"
  | "associate"
  | "bachelor"
  | "master"
  | "phd"
  | "any"

export type SeniorityRequirement = "junior" | "mid" | "senior" | "lead" | "any"

export interface RuleScoreComponents {
  skill: {
    score: number
    weight: number
    weighted: number
    required_matched: number
    required_total: number
    optional_matched: number
    optional_total: number
    matching: string[]
    missing_required: string[]
    missing_optional: string[]
  }
  experience: {
    score: number
    weight: number
    weighted: number
    required_years: number | null
    candidate_years: number | null
    required_level: string | null
    candidate_level: string | null
    meets: boolean | null
  }
  education: {
    score: number
    weight: number
    weighted: number
    required: EducationRequirement | null
    candidate: EducationLevel | null
    field_relevant: boolean | null
    degree: string | null
  }
  optional_bonus: {
    score: number
    weight: number
    weighted: number
  }
}

export interface SemanticComponent {
  cosine_similarity: number | null
  score: number
  weight: number
  weighted: number
  model: string | null
  source: "stored" | "generated" | "llm" | null
}

export interface ScoringBreakdown {
  algorithm_version: string
  rule_score: number
  semantic_score: number
  final_score: number
  components: RuleScoreComponents
  semantic: SemanticComponent
  positive_factors: string[]
  negative_factors: string[]
  calculated_at: string
}

export interface AlgorithmWeights {
  rule_weight: number
  semantic_weight: number
  skill_weight: number
  experience_weight: number
  education_weight: number
  optional_bonus_weight: number
}

export interface ATSScore {
  id: string
  application_id: string
  job_id: string
  candidate_id: string
  rule_score: number
  semantic_score: number
  final_score: number
  scoring_breakdown: ScoringBreakdown
  algorithm_version: string
  status: "pending" | "calculating" | "completed" | "failed"
  error_message: string | null
  calculated_at: string | null
  created_at: string
  updated_at: string
}

export interface SemanticResult {
  cosineSimilarity: number | null
  semanticScore: number
  embeddingSource: "stored" | "generated" | "llm" | null
  modelUsed: string | null
  tokensUsed?: number
  latencyMs?: number
}

