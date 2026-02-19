import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { SubscriptionCard } from "@/components/company/SubscriptionCard"
import type { SubscriptionStatus } from "@/lib/types"
import { getPlanDisplayName } from "@/lib/billing/plans"
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
  Briefcase,
  FileText,
  Users,
  CreditCard,
  Plus,
  ArrowRight,
  ChevronRight,
  Info,
} from "lucide-react"

const SUBSCRIPTION_BADGE: Record<SubscriptionStatus, string> = {
  pending_payment: "Ödeme Bekleniyor",
  active: "Aktif",
  past_due: "Ödeme Gecikmiş",
  cancelled: "İptal",
}

export default async function CompanyDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, company_id")
    .eq("id", user.id)
    .single()

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, description, location, website, industry, employee_count, logo_url, plan, subscription_status, billing_period, current_plan_price, last_payment_at, subscription_ends_at, contact_email, phone, address, legal_title, tax_number, tax_office")
    .eq("id", profile?.company_id)
    .single()

  const { count: jobCount } = await supabase
    .from("job_postings")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company?.id ?? "")

  const { count: activeJobCount } = await supabase
    .from("job_postings")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company?.id ?? "")
    .eq("status", "active")

  const { data: companyJobs } = await supabase
    .from("job_postings")
    .select("id")
    .eq("company_id", company?.id ?? "")

  const jobIds = companyJobs?.map((j) => j.id) || []

  const { count: applicationCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .in("job_id", jobIds.length > 0 ? jobIds : [""])

  const { data: recentJobs } = await supabase
    .from("job_postings")
    .select("id, title, status, created_at")
    .eq("company_id", company?.id ?? "")
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

  const companyWithExtras = company as typeof company & {
    contact_email?: string | null
    phone?: string | null
    address?: string | null
    legal_title?: string | null
    tax_number?: string | null
    tax_office?: string | null
  }

  const isPremium = company?.plan === "premium"
  const subStatus = company?.subscription_status as SubscriptionStatus | null

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      {/* Üst başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt=""
                className="size-14 rounded-xl object-contain border border-border bg-card"
              />
            ) : (
              <div className="size-14 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/50 flex items-center justify-center">
                <Briefcase className="size-7 text-muted-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {company?.name ?? "Şirket Paneli"}
              </h1>
              <p className="text-sm text-muted-foreground">
                İlanlarınızı ve başvuruları yönetin
              </p>
              <p className="mt-1 text-xs text-primary/80">
                ATS skorları ve AI tabanlı CV eşleştirme ile en uygun adayları öne çıkarın.
              </p>
            </div>
          </div>
        <Button asChild>
          <Link href="/dashboard/company/ayarlar" className="gap-2">
            Şirket bilgilerini düzenle
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      {/* Üst özet kartları – 4 kart (referans görsel) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Aktif İlanlar
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {activeJobCount ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dikkat gerektirmiyor
                </p>
              </div>
              <div className="rounded-xl bg-green-500/10 p-2.5">
                <Briefcase className="size-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Toplam Başvuru
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {applicationCount ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tüm ilanlara gelen başvuru
                </p>
              </div>
              <div className="rounded-xl bg-primary/10 p-2.5">
                <FileText className="size-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Çalışan Sayısı
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {company?.employee_count ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Kayıtlı çalışan
                </p>
              </div>
              <div className="rounded-xl bg-muted p-2.5">
                <Users className="size-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Abonelik
                </p>
                <p className="text-xl font-bold text-foreground mt-1">
                  {subStatus
                    ? SUBSCRIPTION_BADGE[subStatus]
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {company?.plan ? `${getPlanDisplayName(company.plan)} plan` : "—"}
                </p>
              </div>
              <div
                className={`rounded-xl p-2.5 ${
                  subStatus === "active"
                    ? "bg-green-500/10"
                    : subStatus === "pending_payment"
                      ? "bg-amber-500/10"
                      : "bg-muted"
                }`}
              >
                <CreditCard
                  className={`size-5 ${
                    subStatus === "active"
                      ? "text-green-600 dark:text-green-400"
                      : subStatus === "pending_payment"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-muted-foreground"
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ana alan: Sol tablo + Sağ paneller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Son İlanlar tablosu */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Son İlanlar</CardTitle>
                <CardDescription>
                  En son oluşturduğunuz ilanlar
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/company/ilanlar">Tümü</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/dashboard/company/ilanlar/olustur" className="gap-1">
                    <Plus className="size-4" />
                    Yeni İlan
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!recentJobs || recentJobs.length === 0 ? (
                <div className="px-6 pb-6">
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    Henüz ilan oluşturmadınız.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/dashboard/company/ilanlar/olustur">
                      <Plus className="mr-2 size-4" />
                      İlk İlanı Oluştur
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left font-medium py-3 px-4">
                          İlan
                        </th>
                        <th className="text-left font-medium py-3 px-4">
                          Durum
                        </th>
                        <th className="text-left font-medium py-3 px-4">
                          Tarih
                        </th>
                        <th className="text-left font-medium py-3 px-4">
                          Başvuru
                        </th>
                        <th className="w-10 py-3 px-4" />
                      </tr>
                    </thead>
                    <tbody>
                      {recentJobs.map((job) => (
                        <tr
                          key={job.id}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium">
                            <Link
                              href={`/dashboard/company/ilanlar/${job.id}`}
                              className="text-primary hover:underline"
                            >
                              {job.title}
                            </Link>
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
                              {job.status === "active"
                                ? "Aktif"
                                : job.status === "draft"
                                  ? "Taslak"
                                  : "Kapalı"}
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
                              href={`/dashboard/company/ilanlar/${job.id}`}
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

        {/* Sağ: Hızlı Erişim + Gradient Özet */}
        <div className="space-y-6">
          <Card className="rounded-2xl border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Hızlı Erişim</CardTitle>
              <CardDescription>Yaygın sayfalar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href="/dashboard/company/ilanlar">
                  İlanlar
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href="/dashboard/company/basvurular">
                  Başvurular
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href="/dashboard/company/eslesmeler">
                  Eşleşmeler
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href="/dashboard/company/uyelik">
                  Üyelik
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Koyu gradient kart (referans: Validation Queue) */}
          <Card className="rounded-2xl border-0 overflow-hidden bg-gradient-to-b from-primary/20 via-primary/10 to-primary/5 dark:from-primary/30 dark:via-primary/15 dark:to-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-foreground">
                Özet
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Hızlı bilgi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-background/50 dark:bg-background/30 p-3">
                  <p className="text-2xl font-bold text-primary">
                    {jobCount ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Toplam ilan</p>
                </div>
                <div className="rounded-lg bg-background/50 dark:bg-background/30 p-3">
                  <p className="text-2xl font-bold text-primary">
                    {activeJobCount ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Aktif ilan</p>
                </div>
              </div>
              <div className="flex gap-2 rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10 p-3 text-sm">
                <Info className="size-4 shrink-0 text-primary mt-0.5" />
                <p className="text-muted-foreground">
                  Başvuruları inceleyip adayları değerlendirmek için Başvurular
                  sayfasını kullanın.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Abonelik kartı (mevcut bilgi) */}
      {company && (
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Abonelik</CardTitle>
            <CardDescription>
              Plan ve ödeme bilgileri. Değiştirmek için üyelik merkezine gidin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionCard
              companyId={company.id}
              plan={company.plan ?? "free"}
              subscriptionStatus={company.subscription_status ?? "pending_payment"}
              billingPeriod={company.billing_period ?? "monthly"}
              lastPaymentAt={company.last_payment_at}
              subscriptionEndsAt={company.subscription_ends_at}
              currentPlanPrice={company.current_plan_price}
            />
            <p className="text-sm text-muted-foreground mt-4">
              <Link
                href="/dashboard/company/uyelik"
                className="text-primary underline-offset-2 hover:underline"
              >
                Üyelik merkezine git →
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Genel bilgiler (kompakt) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Genel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="Sektör" value={company?.industry} />
            <InfoRow label="Konum" value={company?.location} />
            <InfoRow
              label="Website"
              value={company?.website}
              href={company?.website ? company.website : undefined}
            />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">İletişim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="E-posta" value={companyWithExtras?.contact_email} />
            <InfoRow label="Telefon" value={companyWithExtras?.phone} />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Resmî</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="Ticari unvan" value={companyWithExtras?.legal_title} />
            <InfoRow label="Vergi no." value={companyWithExtras?.tax_number} />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Açıklama</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-4">
              {company?.description || "Açıklama eklenmemiş."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  href,
}: {
  label: string
  value?: string | null
  href?: string
}) {
  if (value == null || value === "") return <InfoRowRaw label={label} value="—" />
  if (href)
    return (
      <InfoRowRaw
        label={label}
        value={
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            {value}
          </a>
        }
      />
    )
  return <InfoRowRaw label={label} value={value} />
}

function InfoRowRaw({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="flex gap-2">
      <dt className="font-medium text-foreground shrink-0">{label}:</dt>
      <dd className="text-muted-foreground min-w-0 truncate">{value}</dd>
    </div>
  )
}
