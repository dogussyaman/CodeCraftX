import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, Briefcase, Banknote } from "lucide-react"

export default async function StatisticsPage() {
  const supabase = await createClient()

  // Detaylı istatistikler
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })
  const { count: developers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "developer")
  const { count: hrUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "hr")

  const { count: companies } = await supabase.from("companies").select("*", { count: "exact", head: true })
  const { count: totalJobs } = await supabase.from("job_postings").select("*", { count: "exact", head: true })
  const { count: activeJobs } = await supabase
    .from("job_postings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  const { count: totalCVs } = await supabase.from("cvs").select("*", { count: "exact", head: true })
  const { count: processedCVs } = await supabase
    .from("cvs")
    .select("*", { count: "exact", head: true })
    .eq("status", "processed")

  const { count: matches } = await supabase.from("matches").select("*", { count: "exact", head: true })
  const { count: applications } = await supabase.from("applications").select("*", { count: "exact", head: true })

  const { count: activeSubscriptions } = await supabase
    .from("companies")
    .select("*", { count: "exact", head: true })
    .eq("subscription_status", "active")

  const { data: successPayments } = await supabase
    .from("company_payments")
    .select("amount")
    .eq("status", "success")
  const totalRevenue = successPayments?.reduce((sum, p) => sum + Number(p.amount ?? 0), 0) ?? 0

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <BarChart3 className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Platform İstatistikleri</h1>
            <p className="text-sm text-muted-foreground">Detaylı platform metrikleri ve raporlar</p>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Kullanıcı İstatistikleri
          </CardTitle>
          <CardDescription>Kayıtlı kullanıcı dağılımı</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{totalUsers || 0}</div>
              <div className="text-sm text-muted-foreground">Toplam Kullanıcı</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{developers || 0}</div>
              <div className="text-sm text-muted-foreground">Geliştirici</div>
              <div className="text-xs text-muted-foreground">
                %{totalUsers ? Math.round(((developers || 0) / totalUsers) * 100) : 0}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{hrUsers || 0}</div>
              <div className="text-sm text-muted-foreground">İK Uzmanı</div>
              <div className="text-xs text-muted-foreground">
                %{totalUsers ? Math.round(((hrUsers || 0) / totalUsers) * 100) : 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abonelik ve Gelir */}
      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="size-5" />
            Abonelik ve Gelir
          </CardTitle>
          <CardDescription>Toplam abonelik geliri ve aktif abonelikli şirket sayısı</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">
                {totalRevenue.toLocaleString("tr-TR")} ₺
              </div>
              <div className="text-sm text-muted-foreground">Toplam Abonelik Geliri</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{activeSubscriptions ?? 0}</div>
              <div className="text-sm text-muted-foreground">Aktif Abonelikli Şirket</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İş İlanı İstatistikleri */}
      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="size-5" />
            İş İlanı İstatistikleri
          </CardTitle>
          <CardDescription>İlan ve başvuru metrikleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{companies || 0}</div>
              <div className="text-sm text-muted-foreground">Şirket</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{totalJobs || 0}</div>
              <div className="text-sm text-muted-foreground">Toplam İlan</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{activeJobs || 0}</div>
              <div className="text-sm text-muted-foreground">Aktif İlan</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{applications || 0}</div>
              <div className="text-sm text-muted-foreground">Başvuru</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Eşleştirme İstatistikleri */}
      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" />
            Eşleştirme İstatistikleri
          </CardTitle>
          <CardDescription>CV ve eşleştirme performansı</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{totalCVs || 0}</div>
              <div className="text-sm text-muted-foreground">Toplam CV</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{processedCVs || 0}</div>
              <div className="text-sm text-muted-foreground">İşlenmiş CV</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">{matches || 0}</div>
              <div className="text-sm text-muted-foreground">Eşleşme</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">
                {developers && matches ? Math.round(matches / developers) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Ort. Eşleşme/Kişi</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performans Metrikleri */}
      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5" />
            Platform Performansı
          </CardTitle>
          <CardDescription>Önemli performans göstergeleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">
                {processedCVs && totalCVs ? Math.round((processedCVs / totalCVs) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">CV İşleme Oranı</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">
                {applications && totalJobs ? Math.round(applications / totalJobs) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Ort. Başvuru/İlan</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-foreground">
                {matches && totalJobs ? Math.round(matches / totalJobs) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Ort. Eşleşme/İlan</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
