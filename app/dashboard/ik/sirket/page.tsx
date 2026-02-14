import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, FileText, Users, Building2 } from "lucide-react"

export default async function HrCompanyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single()

  if (!profile?.company_id) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl min-h-screen">
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardContent className="p-6 space-y-3">
            <h1 className="text-2xl font-bold">Şirket Bilgisi Bulunamadı</h1>
            <p className="text-sm text-muted-foreground">
              Bu İK kullanıcısına bağlı bir şirket bulunamadı. Lütfen şirket yöneticiniz ile iletişime geçin.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, description, location, website, industry, employee_count")
    .eq("id", profile.company_id)
    .single()

  const { count: jobCount } = await supabase
    .from("job_postings")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company?.id ?? "")

  const { data: companyJobs } = await supabase
    .from("job_postings")
    .select("id")
    .eq("company_id", company?.id ?? "")

  const jobIds = companyJobs?.map((j) => j.id) || []

  const { count: applicationCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .in("job_id", jobIds.length > 0 ? jobIds : [""])

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Building2 className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {company?.name ?? "Şirket Bilgileri"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Bağlı olduğunuz şirketin temel bilgilerini ve istatistiklerini görüntüleyin.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam İlan</p>
                <p className="text-3xl font-bold text-foreground mt-1">{jobCount ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Açık ilanlar</p>
              </div>
              <div className="rounded-xl bg-primary/10 p-2.5">
                <Briefcase className="size-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Başvuru</p>
                <p className="text-3xl font-bold text-foreground mt-1">{applicationCount ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Tüm ilanlara</p>
              </div>
              <div className="rounded-xl bg-green-500/10 p-2.5">
                <FileText className="size-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Çalışan Sayısı</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {company?.employee_count ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Profil bilgisi</p>
              </div>
              <div className="rounded-xl bg-muted p-2.5">
                <Users className="size-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Şirket Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Sektör: </span>
              {company?.industry || "-"}
            </p>
            <p>
              <span className="font-medium text-foreground">Konum: </span>
              {company?.location || "-"}
            </p>
            <p>
              <span className="font-medium text-foreground">Website: </span>
              {company?.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {company.website}
                </a>
              ) : (
                "-"
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Açıklama</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {company?.description || "Şirket açıklaması henüz eklenmemiş."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

