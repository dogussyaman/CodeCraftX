import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Plus, MapPin } from "lucide-react"
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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Briefcase className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">İş İlanları</h1>
            <p className="text-sm text-muted-foreground">Şirketiniz için ilanlar oluşturun ve yönetin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
        {canCreateJob ? (
          <Button asChild>
            <Link href="/dashboard/company/ilanlar/olustur">
              <Plus className="mr-2 size-4" />
              Yeni İlan
            </Link>
          </Button>
        ) : (
          <div className="flex flex-col items-end gap-2">
            <Button disabled>
              <Plus className="mr-2 size-4" />
              Yeni İlan
            </Button>
            <p className="text-xs text-muted-foreground max-w-xs text-right">
              İlan oluşturmak için aboneliğinizin aktif olması gerekir. Lütfen şirket panelinden ödemeyi tamamlayın.
            </p>
          </div>
        )}
        </div>
      </div>

      {!jobs || jobs.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border bg-muted/30 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="size-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Henüz ilan oluşturmadınız</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              İlk iş ilanınızı oluşturarak aday aramaya başlayın
            </p>
            {canCreateJob ? (
              <Button asChild>
                <Link href="/dashboard/company/ilanlar/olustur">
                  <Plus className="mr-2 size-4" />
                  İlk İlanı Oluştur
                </Link>
              </Button>
            ) : (
              <Button disabled>
                <Plus className="mr-2 size-4" />
                Abonelik Bekleniyor
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((job: any) => (
            <Card
              key={job.id}
              className="rounded-2xl border border-border bg-card shadow-sm hover:border-primary/50 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <Badge
                        variant={job.status === "active" ? "default" : "secondary"}
                        className={job.status === "active" ? "bg-success/10 text-success" : ""}
                      >
                        {job.status === "active" ? "Aktif" : job.status === "draft" ? "Taslak" : "Kapalı"}
                      </Badge>
                    </div>
                    <CardDescription>{job.companies?.name}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {job.location}
                    </div>
                  )}
                  {job.job_type && (
                    <Badge variant="outline" className="capitalize">
                      {job.job_type.replace("-", " ")}
                    </Badge>
                  )}
                  {job.experience_level && (
                    <Badge variant="outline" className="capitalize">
                      {job.experience_level}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/company/ilanlar/${job.id}`}>Düzenle</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/company/eslesmeler?job=${job.id}`}>Eşleşmeleri Gör</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

