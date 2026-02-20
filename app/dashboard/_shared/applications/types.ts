export type DashboardRole = "company" | "hr"

export type MatchDetails = {
  matching_skills?: string[]
  missing_skills?: string[]
  missing_optional?: string[]
  positive_factors?: string[]
  negative_factors?: string[]
  experience_analysis?: {
    candidate_years: number
    required_level: string
    candidate_level: string
    level_match: boolean
    note: string
  } | null
  education_match?: {
    relevant: boolean
    degree_level: string
    field_relevance: string
  } | null
}

export type ApplicationRow = {
  id: string
  developer_id: string
  status: string
  created_at: string
  expected_salary?: number | null
  cover_letter?: string | null
  match_score?: number | null
  match_reason?: string | null
  match_details?: MatchDetails | null
  ats_scores?: { final_score: number | null }[] | null
  job_postings?: { title?: string | null } | null
  profiles?: { full_name?: string | null; email?: string | null; phone?: string | null } | null
  cvs?: { file_name?: string | null; file_url?: string | null } | null
}

export type LocalAnalysisResult = {
  match_score: number
  match_reason: string
  match_details: MatchDetails
}

