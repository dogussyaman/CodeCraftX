import type { Match, JobPosting, Company, Application } from "@/lib/types"

/**
 * Dashboard sayfalarında kullanılan genişletilmiş tipler
 */

export interface MatchWithJob extends Match {
  job_postings: JobPostingWithCompany | null
}

export interface JobPostingWithCompany extends JobPosting {
  companies: Company | null
}

export interface ApplicationWithJob extends Application {
  job_postings: JobPostingWithCompany | null
}

export interface DashboardStats {
  cvCount: number
  matchCount: number
  applicationCount: number
  companyCount?: number
  jobCount?: number
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: "developer" | "hr" | "admin"
  avatar_url?: string
  phone?: string
  bio?: string
  title?: string
}
