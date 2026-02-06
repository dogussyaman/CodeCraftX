export type UserRole = "developer" | "hr" | "admin"

export type JobType = "full-time" | "part-time" | "contract" | "internship" | "freelance"

export type ExperienceLevel = "junior" | "mid" | "senior" | "lead"

export type SkillCategory = "programming" | "framework" | "tool" | "soft-skill" | "language"

export type ProficiencyLevel = "basic" | "intermediate" | "advanced" | "expert"

export type JobStatus = "active" | "closed" | "draft"

export type CVStatus = "pending" | "processed" | "failed"

export type MatchStatus = "suggested" | "viewed" | "contacted" | "rejected" | "hired"

export type ApplicationStatus = "pending" | "reviewed" | "interview" | "rejected" | "accepted"

export type ContentStatus = "draft" | "published" | "archived"


export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  role: UserRole
  avatar_url?: string | null
  created_at: string
  updated_at: string
}

export type CompanyPlan = "free" | "orta" | "premium"

export type SubscriptionStatus =
  | "pending_payment"
  | "active"
  | "past_due"
  | "cancelled"

export type BillingPeriod = "monthly" | "annually"

export interface Company {
  id: string
  name: string
  description?: string
  industry?: string
  website?: string
  logo_url?: string
  location?: string
  employee_count?: string
  plan?: CompanyPlan
  subscription_status?: SubscriptionStatus
  billing_period?: BillingPeriod
  current_plan_price?: number
  subscription_started_at?: string
  subscription_ends_at?: string
  last_payment_at?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface JobPosting {
  id: string
  company_id: string
  title: string
  description: string
  requirements: string
  responsibilities?: string
  location?: string
  job_type?: JobType
  experience_level?: ExperienceLevel
  salary_min?: number
  salary_max?: number
  status: JobStatus
  created_by: string
  created_at: string
  updated_at: string
}

export interface Skill {
  id: string
  name: string
  category?: SkillCategory
  created_at: string
}

export interface CV {
  id: string
  developer_id: string
  file_url: string
  file_name: string
  parsed_data?: any
  raw_text?: string
  status: CVStatus
  created_at: string
  updated_at: string
}

export interface CVProfile {
  id: string
  cv_id: string
  skills: string[]
  experience_years?: number
  roles: string[]
  seniority?: 'junior' | 'mid' | 'senior'
  summary?: string
  created_at: string
  updated_at: string
}

export interface CoverLetter {
  id: string
  developer_id: string
  title: string
  content: string
  is_favorite?: boolean
  created_at: string
  updated_at: string
}

export interface Match {
  id: string
  job_id: string
  developer_id: string
  match_score: number
  matching_skills?: any
  missing_skills?: any
  status: MatchStatus
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  job_id: string
  developer_id: string
  cv_id?: string
  cover_letter?: string
  match_score?: number
  match_reason?: string
  status: ApplicationStatus
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  long_description?: string
  technologies: string[]
  github_url?: string
  demo_url?: string
  image_url?: string
  stars: number
  views: number
  category?: string
  created_by?: string
  status: ContentStatus
  inspired_by?: string | null
  created_at: string
  updated_at: string
}


export interface ProjectLike {
  id: string
  project_id: string
  user_id: string
  created_at: string
}

export interface ProjectJoinRequest {
  id: string
  project_id: string
  user_id: string
  message: string | null
  status: "pending" | "approved" | "rejected"
  created_at: string
  responded_at: string | null
}


export interface Notification {
  id: string
  recipient_id: string
  actor_id: string | null
  type: 'new_application' | 'application_status_changed' | 'new_match' | 'cv_processed' | 'cv_failed' | 'new_contact_message' | 'support_ticket_resolved' | 'system'
  title: string
  body: string | null
  href: string | null
  data: Record<string, any>
  read_at: string | null
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  body: string
  author_id: string
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface BlogComment {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  body: string
  created_at: string
}

/** Canlı destek sohbeti – CodeCraftX ↔ MT */
export type ChatConversationStatus = "open" | "in_progress" | "closed"

export interface ChatConversation {
  id: string
  support_ticket_id: string | null
  participant_user_id: string
  mt_user_id: string | null
  status: ChatConversationStatus
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  attachment_urls?: string[]
  read_at: string | null
  created_at: string
}