import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Plus, MapPin, Pencil, Users, ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function CompanyJobsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  const { data: company } = await supabase
    .from("companies")
    .select("subscription_status")
    .eq("id", profile?.company_id ?? "")
    .single()

  const subscriptionStatus = company?.subscription_status as string | null
  const canCreateJob = subscriptionStatus === "active"

  const { data: jobs } = await supabase
    .from("job_postings")
    .select(
      `
      *,
      companies:company_id (
        name
      )
    `,
    )
    .eq("company_id", profile?.company_id ?? "")
    .order("created_at", { ascending: false })

  const stats = {
    total: jobs?.length ?? 0,
    active: jobs?.filter((j: { status: string }) => j.status === "active").length ?? 0,
    draft: jobs?.filter((j: { status: string }) => j.status === "draft").length ?? 0,
  }

  return (
    <div className="min-h-screen from-muted/30 to-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm ring-1 ring-primary/10">
              <Briefcase className="size-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                İş İlanları
              </h1>
              <p className="mt-1 text-sm text-muted-foreground dark:text-foreground/75">
                İlanlarınızı yönetin, adaylarla eşleşin
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {canCreateJob ? (
              <Button asChild size="lg" className="rounded-xl shadow-sm">
                <Link href="/dashboard/company/ilanlar/olustur" className="gap-2">
                  <Plus className="size-4" />
                  Yeni İlan
                </Link>
              </Button>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left dark:border-amber-900/50 dark:bg-amber-950/30">
                <Button disabled size="lg" className="rounded-lg w-full sm:w-auto">
                  <Plus className="mr-2 size-4" />
                  Yeni İlan
                </Button>
                <p className="mt-2 text-xs text-muted-foreground max-w-xs">
                  İlan oluşturmak için aboneliğinizin aktif olması gerekir.
                </p>
              </div>
            )}
          </div>
        </header>

        {/* Stats */}
        {jobs && jobs.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm">
              <p className="text-2xl font-semibold tabular-nums text-foreground">{stats.total}</p>
              <p className="text-xs font-medium text-muted-foreground dark:text-foreground/75">Toplam ilan</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm">
              <p className="text-2xl font-semibold tabular-nums text-green-600 dark:text-green-500">{stats.active}</p>
              <p className="text-xs font-medium text-muted-foreground dark:text-foreground/75">Aktif</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm col-span-2 sm:col-span-1">
              <p className="text-2xl font-semibold tabular-nums text-muted-foreground dark:text-foreground/80">{stats.draft}</p>
              <p className="text-xs font-medium text-muted-foreground dark:text-foreground/75">Taslak</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!jobs || jobs.length === 0 ? (
          <Card className="overflow-hidden rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-20 px-6">
              <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-muted">
                <Briefcase className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Henüz ilan yok</h3>
              <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                İlk iş ilanınızı oluşturarak doğru adaylarla eşleşmeye başlayın.
              </p>
              {canCreateJob ? (
                <Button asChild size="lg" className="mt-8 rounded-xl">
                  <Link href="/dashboard/company/ilanlar/olustur" className="gap-2">
                    <Plus className="size-4" />
                    İlk İlanı Oluştur
                  </Link>
                </Button>
              ) : (
                <Button disabled size="lg" className="mt-8 rounded-xl">
                  Abonelik gerekli
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {jobs.map((job: Record<string, unknown> & { id: string; title: string; description?: string; status: string; location?: string; job_type?: string; experience_level?: string; application_count?: number; companies?: { name?: string } }) => (
              <Card
                key={job.id}
                className="group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-lg font-semibold leading-tight sm:text-xl">
                          {job.title}
                        </CardTitle>
                        <Badge
                          variant={job.status === "active" ? "default" : "secondary"}
                          className={
                            job.status === "active"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-medium"
                              : "font-medium dark:border-muted-foreground/50 dark:bg-muted/70 dark:text-foreground"
                          }
                        >
                          {job.status === "active" ? "Aktif" : job.status === "draft" ? "Taslak" : "Kapalı"}
                        </Badge>
                      </div>
                      {job.companies?.name && (
                        <CardDescription className="mt-1">{job.companies.name}</CardDescription>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" variant="outline" className="rounded-lg" asChild>
                        <Link href={`/dashboard/company/ilanlar/${job.id}`} className="gap-1.5">
                          <Pencil className="size-3.5" />
                          Düzenle
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-lg" asChild>
                        <Link href={`/dashboard/company/eslesmeler?job=${job.id}`} className="gap-1.5">
                          <Users className="size-3.5" />
                          Eşleşmeler
                          <ArrowRight className="size-3.5 opacity-60" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {job.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground dark:text-foreground/80">
                      {job.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {job.location && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/80 px-2.5 py-1 text-muted-foreground dark:border-muted-foreground/40 dark:text-foreground/85">
                        <MapPin className="size-3.5" />
                        {job.location}
                      </span>
                    )}
                    {job.job_type && (
                      <Badge variant="secondary" className="font-normal capitalize rounded-md border dark:border-muted-foreground/50">
                        {String(job.job_type).replace("-", " ")}
                      </Badge>
                    )}
                    {job.experience_level && (
                      <Badge variant="secondary" className="font-normal capitalize rounded-md border dark:border-muted-foreground/50">
                        {job.experience_level}
                      </Badge>
                    )}
                    {typeof job.application_count === "number" && job.application_count > 0 && (
                      <span className="text-muted-foreground dark:text-foreground/80">
                        {job.application_count} başvuru
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
