import { createServerClient } from "@/lib/supabase/server"
import { JobsHero } from "./_components/JobsHero"
import { JobsFilters } from "./_components/JobsFilters"
import { JobsList } from "./_components/JobsList"
import { JobsCta } from "./_components/JobsCta"

export default async function IsIlanlariPage() {
  const supabase = await createServerClient()

  const { data: ilanlar } = await supabase
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
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-background">
      <JobsHero />
      <JobsFilters />
      <JobsList ilanlar={ilanlar} />
      <JobsCta />
    </div>
  )
}
