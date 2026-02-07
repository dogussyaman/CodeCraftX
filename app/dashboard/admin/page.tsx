import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Building2,
  Briefcase,
  Star,
  Shield,
  Plus,
  ChevronRight,
  Info,
} from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: companyCount } = await supabase
    .from("companies")
    .select("*", { count: "exact", head: true })

  const { count: jobCount } = await supabase
    .from("job_postings")
    .select("*", { count: "exact", head: true })

  const { count: activeJobCount } = await supabase
    .from("job_postings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  const { count: matchCount } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true })

  const { count: developerCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "developer")

  const { count: hrCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "hr")

  const { count: applicationCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })

  const { data: recentJobs } = await supabase
    .from("job_postings")
    .select(
      "id, title, status, created_at, companies:company_id(name)"
    )
    .order("created_at", { ascending: false })
    .limit(8)

  const recentJobIds = recentJobs?.map((j) => j.id) ?? []
  const { data: appsByJob } = await supabase
    .from("applications")
    .select("job_id")
    .in("job_id", recentJobIds.length > 0 ? recentJobIds : [""])

  const applicationCountByJob: Record<string, number> = {}
  recentJobIds.forEach((id) => (applicationCountByJob[id] = 0))
  appsByJob?.forEach((a) => {
    if (a.job_id && applicationCountByJob[a.job_id] !== undefined)
      applicationCountByJob[a.job_id] += 1
  })

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      {/* Üst başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Shield className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Yönetim Paneli
            </h1>
            <p className="text-sm text-muted-foreground">
              Platform genel bakış ve yönetim
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/admin/sirket-talepleri" className="gap-2">
            Şirket Talepleri
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>

      {/* Üst özet kartları – 4 kart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Toplam Kullanıcı
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {totalUsers ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Kayıtlı kullanıcı
                </p>
              </div>
              <div className="rounded-xl bg-primary/10 p-2.5">
                <Users className="size-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Şirketler
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {companyCount ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Kayıtlı şirket
                </p>
              </div>
              <div className="rounded-xl bg-green-500/10 p-2.5">
                <Building2 className="size-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  İş İlanları
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {jobCount ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeJobCount ?? 0} aktif
                </p>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-2.5">
                <Briefcase className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Eşleşmeler
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {matchCount ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Toplam eşleşme
                </p>
              </div>
              <div className="rounded-xl bg-muted p-2.5">
                <Star className="size-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ana alan: Sol tablo + Sağ paneller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Son İlanlar</CardTitle>
                <CardDescription>
                  Platformda en son eklenen ilanlar
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/admin/sirketler">Şirketler</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {!recentJobs || recentJobs.length === 0 ? (
                <div className="px-6 pb-6">
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    Henüz ilan yok.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left font-medium py-3 px-4">İlan</th>
                        <th className="text-left font-medium py-3 px-4">Şirket</th>
                        <th className="text-left font-medium py-3 px-4">Durum</th>
                        <th className="text-left font-medium py-3 px-4">Tarih</th>
                        <th className="text-left font-medium py-3 px-4">Başvuru</th>
                        <th className="w-10 py-3 px-4" />
                      </tr>
                    </thead>
                    <tbody>
                      {recentJobs.map((job: { id: string; title: string; status: string; created_at: string; companies?: { name: string | null } | null }) => (
                        <tr
                          key={job.id}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium">
                            <Link
                              href={`/dashboard/admin/sirketler`}
                              className="text-primary hover:underline"
                            >
                              {job.title}
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {(job as { companies?: { name: string | null } }).companies?.name ?? "—"}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={job.status === "active" ? "default" : "secondary"}
                              className={
                                job.status === "active"
                                  ? "bg-green-500/10 text-green-700 dark:text-green-400 border-0"
                                  : ""
                              }
                            >
                              {job.status === "active" ? "Aktif" : job.status === "draft" ? "Taslak" : "Kapalı"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(job.created_at).toLocaleDateString("tr-TR")}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-primary">
                              {applicationCountByJob[job.id] ?? 0}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Link
                              href="/dashboard/admin/sirketler"
                              className="text-muted-foreground hover:text-foreground"
                              aria-label="Detay"
                            >
                              <ChevronRight className="size-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Hızlı Erişim</CardTitle>
              <CardDescription>Yönetim sayfaları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href="/dashboard/admin/sirketler">
                  Şirketler
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href="/dashboard/admin/sirket-talepleri">
                  Şirket Talepleri
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href="/dashboard/admin/kullanicilar">
                  Kullanıcılar
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href="/dashboard/admin/eslestirme">
                  Eşleştirme
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href="/dashboard/admin/destek">
                  Destek
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 overflow-hidden bg-gradient-to-b from-primary/20 via-primary/10 to-primary/5 dark:from-primary/30 dark:via-primary/15 dark:to-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-foreground">Özet</CardTitle>
              <CardDescription className="text-muted-foreground">
                Platform istatistikleri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-background/50 dark:bg-background/30 p-3">
                  <p className="text-2xl font-bold text-primary">{developerCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Geliştirici</p>
                </div>
                <div className="rounded-lg bg-background/50 dark:bg-background/30 p-3">
                  <p className="text-2xl font-bold text-primary">{hrCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground">İK</p>
                </div>
              </div>
              <div className="rounded-lg bg-background/50 dark:bg-background/30 p-3">
                <p className="text-2xl font-bold text-primary">{applicationCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Toplam başvuru</p>
              </div>
              <div className="flex gap-2 rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10 p-3 text-sm">
                <Info className="size-4 shrink-0 text-primary mt-0.5" />
                <p className="text-muted-foreground">
                  Şirket taleplerini onaylamak için Şirket Talepleri sayfasını kullanın.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
