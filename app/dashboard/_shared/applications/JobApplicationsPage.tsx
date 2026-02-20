import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { ApplicationStatsCards } from "./ApplicationStatsCards"
import { ApplicationDashboard } from "./ApplicationDashboard"
import { roleContent } from "./presentation"
import type { DashboardRole } from "./types"

interface JobApplicationsPageProps {
  role: DashboardRole
  params: Promise<{ jobId: string }>
  showAssignButton: boolean
}

export default async function JobApplicationsPage({ role, params, showAssignButton }: JobApplicationsPageProps) {
  const { jobId } = await params
  const labels = roleContent(role)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  const { data: job } = await supabase
    .from("job_postings")
    .select("id, title, status, location, created_at, company_id")
    .eq("id", jobId)
    .eq("company_id", profile?.company_id ?? "")
    .single()

  if (!job) notFound()

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

  const { data: matches } = await supabase.from("matches").select("developer_id, match_score").eq("job_id", jobId)

  const { data: assignments } = await supabase
    .from("application_assignments")
    .select("application_id")
    .eq("assigned_to", user.id)
    .eq("status", "active")
    .in("application_id", (applications || []).map((a: { id: string }) => a.id))

  const totalApplications = applications?.length ?? 0
  const sumMatch = (applications || []).reduce(
    (acc, app: { match_score?: number | null }) => (typeof app.match_score === "number" ? acc + app.match_score : acc),
    0,
  )
  const matchCount = (applications || []).filter((app: { match_score?: number | null }) => typeof app.match_score === "number").length
  const averageMatchScore = matchCount > 0 ? Math.round(sumMatch / matchCount) : null

  const interviewStatuses = ["interview", "randevu", "degerlendiriliyor"]
  const interviewCount = (applications || []).filter((app: { status: string }) => interviewStatuses.includes(app.status)).length

  const inMatchesCount = matches?.length ?? 0
  const matchedDeveloperIds = (matches || []).map((m: { developer_id: string }) => m.developer_id)
  const assignedApplicationIds = (assignments || []).map((item: { application_id: string }) => item.application_id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{labels.detailTitle}</h1>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{job.title}</span> - {labels.detailDescription}
          </p>
        </header>

        <ApplicationStatsCards
          totalApplications={totalApplications}
          averageMatchScore={averageMatchScore}
          interviewCount={interviewCount}
          inMatchesCount={inMatchesCount}
        />

        <Card className="rounded-2xl border border-border bg-card shadow-sm dark:border-border/80 dark:bg-card/95">
          <CardContent className="p-4 sm:p-6">
            <ApplicationDashboard
              role={role}
              jobId={job.id}
              applications={applications || []}
              matchedDeveloperIds={matchedDeveloperIds}
              assignedApplicationIds={assignedApplicationIds}
              showAssignButton={showAssignButton}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

