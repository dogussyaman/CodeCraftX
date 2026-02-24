import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { getPlanDisplayName } from "@/lib/billing/plans"
import type { SubscriptionStatus } from "@/lib/types"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  FileText,
  Users,
  CreditCard,
  Plus,
  ArrowRight,
  ChevronRight,
  Settings,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react"

const SUBSCRIPTION_BADGE: Record<SubscriptionStatus, { label: string; className: string }> = {
  pending_payment: { label: "Ödeme Bekleniyor", className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
  active: { label: "Aktif", className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" },
  past_due: { label: "Gecikmiş", className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" },
  cancelled: { label: "İptal", className: "bg-muted text-muted-foreground border-border" },
}

export default async function CompanyDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, company_id")
    .eq("id", user.id)
    .single()

  const { data: company } = await supabase
    .from("companies")
    .select(
      "id, name, description, location, website, industry, employee_count, logo_url, plan, subscription_status, billing_period, current_plan_price, last_payment_at, subscription_ends_at, contact_email, phone, address, legal_title, tax_number, tax_office"
    )
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

  const { count: newApplicationCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .in("job_id", jobIds.length > 0 ? jobIds : [""])
    .eq("status", "pending")

  const { data: recentJobs } = await supabase
    .from("job_postings")
    .select("id, title, status, created_at")
    .eq("company_id", company?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(6)

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

  const subStatus = company?.subscription_status as SubscriptionStatus | null
  const subBadge = subStatus ? SUBSCRIPTION_BADGE[subStatus] : null

  const companyWithExtras = company as typeof company & {
    contact_email?: string | null
    phone?: string | null
    legal_title?: string | null
    tax_number?: string | null
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 min-h-screen max-w-7xl">

      {/* ── Başlık ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {company?.logo_url ? (
            <img
              src={company.logo_url}
              alt=""
              className="size-14 rounded-xl object-contain border border-border bg-card"
            />
          ) : (
            <div className="size-14 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/40 flex items-center justify-center">
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
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/company/ayarlar" className="gap-1.5">
              <Settings className="size-3.5" />
              Ayarlar
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/company/ilanlar/olustur" className="gap-1.5">
              <Plus className="size-3.5" />
              Yeni İlan
            </Link>
          </Button>
        </div>
      </div>

      {/* ── 4 Özet Kart ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Aktif İlanlar"
          value={activeJobCount ?? 0}
          sub={`${jobCount ?? 0} toplam`}
          icon={<Briefcase className="size-4 text-emerald-600 dark:text-emerald-400" />}
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          label="Toplam Başvuru"
          value={applicationCount ?? 0}
          sub={newApplicationCount ? `${newApplicationCount} yeni bekliyor` : "Bekleyen yok"}
          icon={<FileText className="size-4 text-primary" />}
          iconBg="bg-primary/10"
        />
        <StatCard
          label="Çalışan Sayısı"
          value={company?.employee_count ?? "—"}
          sub="Kayıtlı çalışan"
          icon={<Users className="size-4 text-sky-600 dark:text-sky-400" />}
          iconBg="bg-sky-500/10"
        />
        <StatCard
          label="Abonelik"
          value={subBadge?.label ?? "—"}
          sub={company?.plan ? `${getPlanDisplayName(company.plan)} plan` : "—"}
          valueIsText
          icon={
            <CreditCard
              className={`size-4 ${
                subStatus === "active"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : subStatus === "pending_payment"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
              }`}
            />
          }
          iconBg={
            subStatus === "active"
              ? "bg-emerald-500/10"
              : subStatus === "pending_payment"
                ? "bg-amber-500/10"
                : "bg-muted"
          }
        />
      </div>

      {/* ── Ana İçerik: Sol + Sağ ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sol: Son İlanlar */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="font-semibold text-foreground">Son İlanlar</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Son yayınlanan ilanlarınız</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/company/ilanlar">Tümünü Gör</Link>
                </Button>
              </div>
            </div>

            {!recentJobs || recentJobs.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto size-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
                  <Briefcase className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">Henüz ilan oluşturmadınız.</p>
                <Button asChild size="sm">
                  <Link href="/dashboard/company/ilanlar/olustur">
                    <Plus className="mr-2 size-4" />
                    İlk İlanı Oluştur
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors group"
                  >
                    <div
                      className={`size-2 rounded-full shrink-0 ${
                        job.status === "active" ? "bg-emerald-500" : "bg-muted-foreground/30"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/dashboard/company/ilanlar/${job.id}`}
                        className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate block"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(job.created_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          job.status === "active"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-0"
                            : "border-0"
                        }`}
                      >
                        {job.status === "active"
                          ? "Aktif"
                          : job.status === "draft"
                            ? "Taslak"
                            : "Kapalı"}
                      </Badge>
                      <span className="text-xs text-muted-foreground min-w-[3ch] text-right">
                        {applicationCountByJob[job.id] ?? 0}{" "}
                        <span className="text-muted-foreground/60">bvr</span>
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Abonelik bilgi bandı */}
          {company && (
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-4 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground">Abonelik</h2>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/company/uyelik">Yönet →</Link>
                </Button>
              </div>
              <div className="px-6 py-4 flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Plan</p>
                  <p className="font-semibold">{getPlanDisplayName(company.plan ?? "free")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Durum</p>
                  {subBadge && (
                    <Badge variant="outline" className={`text-xs ${subBadge.className}`}>
                      {subBadge.label}
                    </Badge>
                  )}
                </div>
                {company.last_payment_at && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Son ödeme</p>
                    <p className="font-medium">
                      {new Date(company.last_payment_at).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
                {company.subscription_ends_at && subStatus === "active" && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Yenileme tarihi</p>
                    <p className="font-medium">
                      {new Date(company.subscription_ends_at).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sağ: Hızlı erişim + AI önerisi + Bilgiler */}
        <div className="flex flex-col gap-6">
          {/* Hızlı Erişim */}
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground text-sm">Hızlı Erişim</h2>
            </div>
            <div className="p-3 space-y-1">
              {[
                { label: "İlanlar", href: "/dashboard/company/ilanlar", icon: <Briefcase className="size-4" />, badge: activeJobCount ?? 0 },
                { label: "Başvurular", href: "/dashboard/company/basvurular", icon: <FileText className="size-4" />, badge: newApplicationCount ?? 0 },
                { label: "Eşleşmeler", href: "/dashboard/company/eslesmeler", icon: <TrendingUp className="size-4" /> },
                { label: "Üyelik", href: "/dashboard/company/uyelik", icon: <CreditCard className="size-4" /> },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors"
                >
                  <span className="text-muted-foreground">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <Badge variant="secondary" className="text-xs h-5 min-w-[20px] flex items-center justify-center">
                      {item.badge}
                    </Badge>
                  ) : (
                    <ChevronRight className="size-3.5 text-muted-foreground/40" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* AI Öneri Kartı */}
          <div className="rounded-2xl overflow-hidden bg-linear-to-br from-primary/15 via-primary/8 to-transparent border border-primary/20 shadow-sm">
            <div className="px-5 py-4 border-b border-primary/10 flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h2 className="font-semibold text-sm text-foreground">AI İpuçları</h2>
            </div>
            <div className="p-5 space-y-3">
              <AiSuggestionRow
                text="Başvuruları AI ile değerlendirin, en uygun adayları öne çıkarın."
                href="/dashboard/company/basvurular"
              />
              <AiSuggestionRow
                text="ATS skorları ile aday eleme sürecinizi hızlandırın."
                href="/dashboard/company/eslesmeler"
              />
            </div>
          </div>

          {/* Şirket bilgileri – kompakt */}
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-sm text-foreground">Şirket Bilgileri</h2>
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <Link href="/dashboard/company/ayarlar">Düzenle</Link>
              </Button>
            </div>
            <div className="px-5 py-4 space-y-2.5 text-sm">
              <InfoRow label="Sektör" value={company?.industry} />
              <InfoRow label="Konum" value={company?.location} />
              <InfoRow label="E-posta" value={companyWithExtras?.contact_email} />
              <InfoRow
                label="Website"
                value={company?.website}
                href={company?.website ?? undefined}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Alt çubuk: Hızlı durum özeti ─────────────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm px-6 py-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <QuickStat
            icon={<CheckCircle2 className="size-4 text-emerald-500" />}
            label="Aktif ilan"
            value={`${activeJobCount ?? 0}`}
          />
          <QuickStat
            icon={<FileText className="size-4 text-primary" />}
            label="Toplam başvuru"
            value={`${applicationCount ?? 0}`}
          />
          <QuickStat
            icon={<Clock className="size-4 text-amber-500" />}
            label="Bekleyen başvuru"
            value={`${newApplicationCount ?? 0}`}
          />
          <QuickStat
            icon={<Users className="size-4 text-sky-500" />}
            label="Çalışan"
            value={company?.employee_count?.toString() ?? "—"}
          />
          <div className="ml-auto">
            <Button size="sm" asChild>
              <Link href="/dashboard/company/ilanlar/olustur" className="gap-1.5">
                <Plus className="size-3.5" />
                Yeni İlan
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  valueIsText,
}: {
  label: string
  value: string | number
  sub?: string
  icon: ReactNode
  iconBg: string
  valueIsText?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p
            className={`font-bold text-foreground mt-1 leading-tight ${
              valueIsText ? "text-base" : "text-3xl"
            }`}
          >
            {value}
          </p>
          {sub && (
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          )}
        </div>
        <div className={`rounded-xl p-2.5 shrink-0 ${iconBg}`}>{icon}</div>
      </div>
    </div>
  )
}

function AiSuggestionRow({ text, href }: { text: string; href: string }) {
  return (
    <div className="rounded-lg border border-primary/10 bg-background/60 p-3">
      <p className="text-xs text-muted-foreground mb-2">{text}</p>
      <Link
        href={href}
        className="text-xs text-primary hover:underline underline-offset-2 font-medium"
      >
        Görüntüle →
      </Link>
    </div>
  )
}

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold">{value}</span>
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
  if (!value) return (
    <div className="flex gap-2">
      <span className="text-muted-foreground/60 shrink-0">{label}:</span>
      <span className="text-muted-foreground/40">—</span>
    </div>
  )
  return (
    <div className="flex gap-2 min-w-0">
      <span className="text-muted-foreground shrink-0">{label}:</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline-offset-2 hover:underline truncate"
        >
          {value}
        </a>
      ) : (
        <span className="text-foreground truncate">{value}</span>
      )}
    </div>
  )
}
