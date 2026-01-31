import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { JobsHero } from "./_components/JobsHero"
import { JobsFilters } from "./_components/JobsFilters"
import { JobsList } from "./_components/JobsList"
import { JobsCta } from "./_components/JobsCta"

type PageProps = { searchParams: Promise<{ experience_level?: string; job_type?: string }> }

export default async function IsIlanlariPage({ searchParams }: PageProps) {
  const supabase = await createServerClient()
  const params = await searchParams
  const experienceLevel = params.experience_level
  const jobType = params.job_type

  let query = supabase
    .from("job_postings")
    .select(`
      *,
      companies (
        name,
        logo_url
      ),
      job_skills (
        skills (
          name
        )
      )
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50)

  if (experienceLevel) query = query.eq("experience_level", experienceLevel)
  if (jobType) query = query.eq("job_type", jobType)

  const { data: ilanlar } = await query

  return (
    <div className="min-h-screen bg-background">
      <JobsHero />
      <Suspense fallback={<div className="container mx-auto px-4 py-4" />}>
        <JobsFilters />
      </Suspense>
      <JobsList ilanlar={ilanlar} />
      <JobsCta />
    </div>
  )
}
