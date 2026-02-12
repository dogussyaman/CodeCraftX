import { createClient } from "@/lib/supabase/server"
import { MatchesWithFilters } from "./_components/MatchesWithFilters"
import { Star } from "lucide-react"

export default async function HRMatchesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user!.id)
    .single()

  // Şirketin ilanlarını al
  const { data: myJobs } = await supabase
    .from("job_postings")
    .select("id, title")
    .eq("company_id", profile?.company_id ?? "")

  const jobIds = myJobs?.map((job) => job.id) || []

  // Bu ilanlara ait eşleşmeleri al
  const { data: matches } = await supabase
    .from("matches")
    .select(
      `
      *,
      job_postings:job_id (
        title,
        location
      ),
      profiles:developer_id (
        full_name,
        email,
        phone
      )
    `,
    )
    .in("job_id", jobIds.length > 0 ? jobIds : [""])
    .order("match_score", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Star className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Eşleşmeler</h1>
            <p className="text-sm text-muted-foreground">
              İş ilanlarınıza uygun bulunan ve kabul edilen adaylar
            </p>
          </div>
        </div>
      </div>

      <MatchesWithFilters matches={matches || []} jobs={myJobs || []} />
    </div>
  )
}
