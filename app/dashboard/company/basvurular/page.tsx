import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, ArrowRight, Target, BarChart3 } from "lucide-react"
import Link from "next/link"

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

function jobStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Taslak"
    case "active":
    case "published":
      return "Yayında"
    case "in_review":
      return "İncelemede"
    case "archived":
      return "Arşiv"
    case "rejected":
      return "Reddedildi"
    case "closed":
      return "Kapalı"
    case "approved":
      return "Onaylandı"
    case "scheduled":
      return "Zamanlandı"
    default:
      return status
  }
}

function isPublished(status: string) {
  return status === "active" || status === "published"
}

export default async function CompanyApplicationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  const { data: jobs } = await supabase
    .from("job_postings")
    .select(
      `
      id,
      title,
      status,
      location,
      created_at
    `,
    )
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
        statusCounts: {} as Record<string, number>,
      }

    existing.total += 1
    if (typeof app.match_score === "number") {
      existing.sumMatchScore += app.match_score
      existing.matchScoreCount += 1
    }
    existing.statusCounts[app.status] = (existing.statusCounts[app.status] ?? 0) + 1

    summaries.set(app.job_id, existing)
  })

  const totalApplications = Array.from(summaries.values()).reduce((acc, s) => acc + s.total, 0)

  return (
    <div className="min-h-screen from-muted/30 to-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm ring-1 ring-primary/10">
              <Users className="size-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Başvurular
              </h1>
              <p className="mt-1 text-sm text-muted-foreground dark:text-foreground/75">
                İlan bazında başvuruları, AI uyum oranlarını ve süreç durumlarını görün.
              </p>
            </div>
          </div>
          {jobs && jobs.length > 0 && (
            <div className="flex flex-col items-start gap-1 text-sm sm:items-end">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Toplam başvuru</span>
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {totalApplications}
              </span>
            </div>
          )}
        </header>

        {/* Content */}
        {!jobs || jobs.length === 0 ? (
          <Card className="overflow-hidden rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-20 px-6">
              <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-muted">
                <Briefcase className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Henüz ilan yok</h3>
              <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                Önce bir iş ilanı oluşturun, ardından bu ekrandan ilan bazında başvuruları yönetebilirsiniz.
              </p>
              <Button asChild size="lg" className="mt-8 rounded-xl">
                <Link href="/dashboard/company/ilanlar/olustur" className="gap-2">
                  <Briefcase className="size-4" />
                  Yeni İlan Oluştur
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {jobs.map((job) => {
              const summary = summaries.get(job.id) ?? {
                total: 0,
                sumMatchScore: 0,
                matchScoreCount: 0,
                statusCounts: {},
              }
              const avgMatchScore =
                summary.matchScoreCount > 0 ? Math.round(summary.sumMatchScore / summary.matchScoreCount) : null
              const interviewTotal =
                summary.statusCounts["interview"] +
                  summary.statusCounts["randevu"] +
                  summary.statusCounts["değerlendiriliyor"] || 0
              const rejectedTotal = summary.statusCounts["rejected"] + summary.statusCounts["red"] || 0

              return (
                <Card
                  key={job.id}
                  className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base font-semibold leading-tight sm:text-lg">
                            {job.title}
                          </CardTitle>
                          <Badge
                            variant={isPublished(job.status) ? "default" : "secondary"}
                            className={
                              isPublished(job.status)
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-medium"
                                : job.status === "in_review"
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 font-medium"
                                  : "font-medium dark:border-muted-foreground/50 dark:bg-muted/70 dark:text-foreground"
                            }
                          >
                            {jobStatusLabel(job.status)}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs text-muted-foreground">
                          Oluşturulma: {new Date(job.created_at).toLocaleDateString("tr-TR")}
                        </CardDescription>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
                      >
                        <Link href={`/dashboard/company/basvurular/${job.id}`} className="gap-1.5">
                          <ArrowRight className="size-3.5" />
                          Detaylar
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-xl border border-border/60 bg-muted/40 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Toplam başvuru
                        </p>
                        <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                          {summary.total}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/40 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                          <Target className="size-3" />
                          AI uyum
                        </p>
                        <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                          {avgMatchScore != null ? `%${avgMatchScore}` : "-"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/40 px-3 py-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                          <BarChart3 className="size-3" />
                          Süreç
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground space-y-0.5">
                          <span className="block">
                            <span className="font-semibold text-foreground">{interviewTotal || 0}</span> görüşme
                          </span>
                          <span className="block">
                            <span className="font-semibold text-foreground">{rejectedTotal || 0}</span> red
                          </span>
                        </p>
                      </div>
                    </div>

                    {job.location && (
                      <p className="text-xs text-muted-foreground">
                        Lokasyon: <span className="font-medium text-foreground">{job.location}</span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

