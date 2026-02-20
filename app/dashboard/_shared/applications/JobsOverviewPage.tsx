import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Briefcase, ArrowRight, Users, Sparkles, CalendarClock, Ban } from "lucide-react"
import { isPublished, jobStatusLabel, jobStatusVariant, roleContent } from "./presentation"
import type { DashboardRole } from "./types"

type JobRow = {
  id: string
  title: string
  status: string
  location?: string | null
  created_at: string
}

type JobApplicationSummary = {
  total: number
  sumMatchScore: number
  matchScoreCount: number
  statusCounts: Record<string, number>
}

interface JobsOverviewPageProps {
  role: DashboardRole
  basePath: string
  showCreateJobCta: boolean
}

export default async function JobsOverviewPage({ role, basePath, showCreateJobCta }: JobsOverviewPageProps) {
  const labels = roleContent(role)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  const { data: jobs } = await supabase
    .from("job_postings")
    .select("id, title, status, location, created_at")
    .eq("company_id", profile?.company_id ?? "")
    .order("created_at", { ascending: false })

  const jobIds = (jobs as JobRow[] | null)?.map((job) => job.id) || []

  const { data: applications } = await supabase
    .from("applications")
    .select("id, job_id, status, match_score")
    .in("job_id", jobIds.length > 0 ? jobIds : [""])

  const summaries = new Map<string, JobApplicationSummary>()

  ;(applications || []).forEach((app: { job_id: string; status: string; match_score: number | null }) => {
    const existing =
      summaries.get(app.job_id) ?? {
        total: 0,
        sumMatchScore: 0,
        matchScoreCount: 0,
        statusCounts: {},
      }

    existing.total += 1
    if (typeof app.match_score === "number") {
      existing.sumMatchScore += app.match_score
      existing.matchScoreCount += 1
    }
    existing.statusCounts[app.status] = (existing.statusCounts[app.status] ?? 0) + 1
    summaries.set(app.job_id, existing)
  })

  const allSummaries = Array.from(summaries.values())
  const totalApplications = allSummaries.reduce((acc, item) => acc + item.total, 0)
  const totalScore = allSummaries.reduce((acc, item) => acc + item.sumMatchScore, 0)
  const totalScoreCount = allSummaries.reduce((acc, item) => acc + item.matchScoreCount, 0)
  const avgScore = totalScoreCount > 0 ? Math.round(totalScore / totalScoreCount) : null
  const inProcess = allSummaries.reduce(
    (acc, item) =>
      acc + (item.statusCounts["interview"] ?? 0) + (item.statusCounts["randevu"] ?? 0) + (item.statusCounts["degerlendiriliyor"] ?? 0),
    0,
  )
  const rejected = allSummaries.reduce((acc, item) => acc + (item.statusCounts["rejected"] ?? 0) + (item.statusCounts["red"] ?? 0), 0)
  const rejectRate = totalApplications > 0 ? Math.round((rejected / totalApplications) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/25 to-background">
      <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{labels.listTitle}</h1>
            <p className="text-sm text-muted-foreground">{labels.listDescription}</p>
          </div>
          {showCreateJobCta ? (
            <Button asChild className="rounded-xl">
              <Link href={`${basePath}/ilanlar/olustur`} className="gap-2">
                <Briefcase className="size-4" />
                Yeni İlan Oluştur
              </Link>
            </Button>
          ) : null}
        </header>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card className="rounded-2xl border border-border bg-card shadow-sm dark:border-border/80 dark:bg-card/95">
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Toplam Başvuru</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{totalApplications}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border bg-card shadow-sm dark:border-border/80 dark:bg-card/95">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Sparkles className="size-3.5" />
                Ortalama ATS
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{avgScore != null ? `%${avgScore}` : "-"}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border bg-card shadow-sm dark:border-border/80 dark:bg-card/95">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <CalendarClock className="size-3.5" />
                Süreçte
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{inProcess}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border bg-card shadow-sm dark:border-border/80 dark:bg-card/95">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                <Ban className="size-3.5" />
                Red Oranı
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums">%{rejectRate}</p>
            </CardContent>
          </Card>
        </section>

        {!jobs || jobs.length === 0 ? (
          <Card className="rounded-2xl border-2 border-dashed border-border bg-muted/30 dark:bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-2xl bg-muted p-4">
                <Briefcase className="size-9 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Henüz ilan yok</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">{labels.emptyDescription}</p>
              {showCreateJobCta ? (
                <Button asChild className="mt-6 rounded-xl">
                  <Link href={`${basePath}/ilanlar/olustur`}>İlan Oluştur</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {jobs.map((job) => {
              const summary = summaries.get(job.id) ?? { total: 0, sumMatchScore: 0, matchScoreCount: 0, statusCounts: {} }
              const avgMatchScore = summary.matchScoreCount > 0 ? Math.round(summary.sumMatchScore / summary.matchScoreCount) : null
              const interviewTotal =
                (summary.statusCounts["interview"] ?? 0) + (summary.statusCounts["randevu"] ?? 0) + (summary.statusCounts["degerlendiriliyor"] ?? 0)
              const rejectedTotal = (summary.statusCounts["rejected"] ?? 0) + (summary.statusCounts["red"] ?? 0)

              return (
                <Card key={job.id} className="rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:border-border/80 dark:bg-card/95">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base sm:text-lg">{job.title}</CardTitle>
                          <Badge variant={jobStatusVariant(job.status)}>{jobStatusLabel(job.status)}</Badge>
                          {isPublished(job.status) ? <Badge variant="outline">Yayında</Badge> : null}
                        </div>
                        <CardDescription className="text-xs">
                          Oluşturulma: {new Date(job.created_at).toLocaleDateString("tr-TR")}
                        </CardDescription>
                      </div>
                      <Button asChild size="sm" variant="outline" className="rounded-lg">
                        <Link href={`${labels.detailHrefPrefix}/${job.id}`} className="gap-1.5">
                          Detaylar
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl border border-border bg-muted/30 px-3 py-2 dark:border-border/70 dark:bg-muted/20">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Başvuru</p>
                        <p className="text-xl font-semibold tabular-nums">{summary.total}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/30 px-3 py-2 dark:border-border/70 dark:bg-muted/20">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">ATS</p>
                        <p className="text-xl font-semibold tabular-nums">{avgMatchScore != null ? `%${avgMatchScore}` : "-"}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/30 px-3 py-2 dark:border-border/70 dark:bg-muted/20">
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Süreç</p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">{interviewTotal}</span> görüşme /{" "}
                          <span className="font-semibold text-foreground">{rejectedTotal}</span> red
                        </p>
                      </div>
                    </div>
                    {job.location ? <p className="text-xs text-muted-foreground">Lokasyon: <span className="text-foreground">{job.location}</span></p> : null}
                  </CardContent>
                </Card>
              )
            })}
          </section>
        )}
      </div>
    </div>
  )
}

