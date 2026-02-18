import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { notFound } from "next/navigation"
import { ApplicationStatsCards } from "./_components/ApplicationStatsCards"
import { ApplicationDashboard } from "./_components/ApplicationDashboard"

interface JobApplicationsPageProps {
  params: Promise<{ jobId: string }>
}

export default async function JobApplicationsPage({ params }: JobApplicationsPageProps) {
  const { jobId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  const { data: job } = await supabase
    .from("job_postings")
    .select("id, title, status, location, created_at, company_id")
    .eq("id", jobId)
    .eq("company_id", profile?.company_id ?? "")
    .single()

  if (!job) {
    notFound()
  }

  const { data: applications } = await supabase
    .from("applications")
    .select(
      `
      *,
      profiles:developer_id (
        full_name,
        email,
        phone
      ),
      cvs:cv_id (
        file_name,
        file_url
      )
    `,
    )
    .eq("job_id", jobId)
    .order("created_at", { ascending: false })

  const { data: matches } = await supabase
    .from("matches")
    .select("developer_id, match_score")
    .eq("job_id", jobId)

  const totalApplications = applications?.length ?? 0
  const sumMatch = (applications || []).reduce(
    (acc, app: { match_score?: number | null }) => (typeof app.match_score === "number" ? acc + app.match_score : acc),
    0,
  )
  const matchCount = (applications || []).filter((app: { match_score?: number | null }) => typeof app.match_score === "number").length
  const averageMatchScore = matchCount > 0 ? Math.round(sumMatch / matchCount) : null

  const interviewStatuses = ["interview", "randevu", "değerlendiriliyor"]
  const interviewCount =
    (applications || []).filter((app: { status: string }) => interviewStatuses.includes(app.status)).length ?? 0

  const inMatchesCount = matches?.length ?? 0
  const matchedDeveloperIds = (matches || []).map((m: { developer_id: string }) => m.developer_id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Welcome / Header - referans görseldeki gibi */}
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Başvuru detayları
          </h1>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{job.title}</span> — Başvuruları takip edin, AI uyum oranlarını görün ve süreçleri yönetin.
          </p>
        </header>

        <ApplicationStatsCards
          totalApplications={totalApplications}
          averageMatchScore={averageMatchScore}
          interviewCount={interviewCount}
          inMatchesCount={inMatchesCount}
        />

        <Card className="rounded-2xl border border-border/80 bg-card/80 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <ApplicationDashboard
              jobId={job.id}
              applications={applications || []}
              matchedDeveloperIds={matchedDeveloperIds}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

