import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bookmark, Building2, MapPin, ArrowRight } from "lucide-react"
import { JobApplyButton } from "@/components/job-apply-button"
import { SavedJobRemoveButton } from "./_components/SavedJobRemoveButton"

export default async function KaydettigimIlanlarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/giris")

  const { data: savedRows } = await supabase
    .from("saved_jobs")
    .select(
      `
      id,
      created_at,
      job_postings:job_id (
        id,
        title,
        location,
        city,
        job_type,
        companies:company_id (
          id,
          name
        )
      )
    `
    )
    .eq("developer_id", user.id)
    .order("created_at", { ascending: false })

  const { data: applicationIds } = await supabase
    .from("applications")
    .select("job_id")
    .eq("developer_id", user.id)

  const appliedJobIds = new Set((applicationIds ?? []).map((a) => a.job_id))
  const savedJobs = (savedRows ?? []).filter((r) => r.job_postings != null) as Array<{
    id: string
    created_at: string
    job_postings: {
      id: string
      title: string
      location?: string
      city?: string
      job_type?: string
      companies: { id: string; name: string } | null
    }
  }>

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Kaydettiğim İlanlar</h1>
        <p className="text-muted-foreground">Daha sonra başvurmak için kaydettiğiniz ilanlar</p>
      </div>

      {savedJobs.length === 0 ? (
        <Card className="border-dashed bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bookmark className="size-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Henüz kaydedilmiş ilan yok</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              İş ilanı detay sayfasında &quot;Kaydet&quot; ile ilanları buraya ekleyebilirsiniz.
            </p>
            <Button asChild>
              <Link href="/is-ilanlari">
                İlanlara Göz At
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {savedJobs.map((saved) => {
            const job = saved.job_postings
            const locationDisplay = [job.city, job.location].filter(Boolean).join(", ") || job.location
            const hasApplied = appliedJobIds.has(job.id)
            return (
              <Card key={saved.id} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg">
                        <Link
                          href={`/is-ilanlari/${job.id}`}
                          className="hover:underline text-foreground"
                        >
                          {job.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-1 flex flex-wrap items-center gap-3">
                        {job.companies && (
                          <span className="flex items-center gap-1">
                            <Building2 className="size-3.5" />
                            {job.companies.name}
                          </span>
                        )}
                        {locationDisplay && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3.5" />
                            {locationDisplay}
                          </span>
                        )}
                        {job.job_type && <span>{job.job_type}</span>}
                      </CardDescription>
                    </div>
                    <SavedJobRemoveButton savedJobId={saved.id} jobId={job.id} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/is-ilanlari/${job.id}`}>
                      İlanı Görüntüle
                      <ArrowRight className="ml-1 size-3.5" />
                    </Link>
                  </Button>
                  <JobApplyButton
                    jobId={job.id}
                    jobTitle={job.title}
                    label="Başvur"
                    hasApplied={hasApplied}
                    isAuthenticated={true}
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
