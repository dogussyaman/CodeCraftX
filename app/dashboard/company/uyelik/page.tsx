import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { PlanChangeSection } from "@/components/company/PlanChangeSection"

export const dynamic = "force-dynamic"
import { PaymentCallbackHandler } from "@/components/company/PaymentCallbackHandler"
import { PaymentHistoryCard } from "@/components/company/PaymentHistoryCard"
import { getPlanPrice, getPlanDisplayName } from "@/lib/billing/plans"
import type { CompanyPlan, SubscriptionStatus, BillingPeriod } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  Calendar,
  TrendingUp,
  Zap,
  Check,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

const STATUS_CONFIG: Record<SubscriptionStatus, {
  label: string
  icon: typeof CheckCircle2
  badgeCls: string
  dot: string
}> = {
  active: {
    label: "Aktif",
    icon: CheckCircle2,
    badgeCls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  pending_payment: {
    label: "Ödeme Bekleniyor",
    icon: Clock,
    badgeCls: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    dot: "bg-amber-500",
  },
  past_due: {
    label: "Ödeme Gecikmiş",
    icon: AlertCircle,
    badgeCls: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    dot: "bg-red-500",
  },
  cancelled: {
    label: "İptal Edildi",
    icon: XCircle,
    badgeCls: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
}

const PLAN_FEATURES: Record<CompanyPlan, string[]> = {
  free: ["5 aktif ilan", "Temel başvuru yönetimi", "E-posta destek"],
  orta: ["100 aktif ilan", "10 İK çalışanı", "Canlı destek", "AI eşleştirme"],
  premium: ["Sınırsız ilan", "Sınırsız İK", "7/24 destek", "API erişimi", "White-label"],
}

const PLAN_GRADIENT: Record<CompanyPlan, string> = {
  free: "from-zinc-500/10 to-zinc-500/5",
  orta: "from-primary/15 to-primary/5",
  premium: "from-violet-500/15 to-violet-500/5",
}

const PLAN_ICON_COLOR: Record<CompanyPlan, string> = {
  free: "text-zinc-500",
  orta: "text-primary",
  premium: "text-violet-500",
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

function membershipDuration(startedAt: string | null | undefined): string {
  if (!startedAt) return "—"
  try {
    const start = new Date(startedAt)
    const now = new Date()
    const months = Math.max(
      0,
      (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
    )
    if (months < 1) return "1 aydan az"
    if (months === 1) return "1 ay"
    if (months < 12) return `${months} ay`
    const years = Math.floor(months / 12)
    const m = months % 12
    return m === 0
      ? `${years} yıl`
      : `${years} yıl ${m} ay`
  } catch {
    return "—"
  }
}

export default async function CompanyUyelikPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/giris")

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single()

  if (!profile?.company_id) redirect("/dashboard/company")

  const allowedRoles = ["company_admin", "hr"]
  if (!profile.role || !allowedRoles.includes(profile.role)) redirect("/dashboard/company")

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select(
      "id, name, plan, subscription_status, billing_period, current_plan_price, last_payment_at, subscription_ends_at, subscription_started_at"
    )
    .eq("id", profile.company_id)
    .single()

  if (companyError || !company) redirect("/dashboard/company")

  // Admin client: güncel şirket verisini RLS bypass ederek alıyoruz
  const adminClient = createAdminClient()

  const { data: freshCompany } = await adminClient
    .from("companies")
    .select(
      "id, name, plan, subscription_status, billing_period, current_plan_price, last_payment_at, subscription_ends_at, subscription_started_at"
    )
    .eq("id", profile.company_id)
    .single()

  const activeCompany = freshCompany ?? company

  const plan = (activeCompany.plan as CompanyPlan) ?? "free"
  const subscriptionStatus = (activeCompany.subscription_status as SubscriptionStatus) ?? "pending_payment"
  const billingPeriod = (activeCompany.billing_period as BillingPeriod) ?? "monthly"

  const displayPrice = activeCompany.current_plan_price ?? getPlanPrice(plan, billingPeriod)
  const isActive = subscriptionStatus === "active"
  const statusCfg = STATUS_CONFIG[subscriptionStatus]
  const StatusIcon = statusCfg.icon

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 min-h-screen max-w-6xl">
      <Suspense fallback={null}>
        <PaymentCallbackHandler />
      </Suspense>

      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Üyelik Merkezi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Aboneliğinizi görüntüleyin, plan değiştirin ve ödeme geçmişinize bakın.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/company" className="gap-1.5">
            <ArrowRight className="size-3.5 rotate-180" />
            Panele Dön
          </Link>
        </Button>
      </div>

      {/* ── Üst İki Sütun: Plan + İstatistikler ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Mevcut Plan – geniş kart */}
        <div className={`lg:col-span-2 rounded-2xl border border-border bg-linear-to-br ${PLAN_GRADIENT[plan]} overflow-hidden`}>
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-background/70 p-2.5">
                    <CreditCard className={`size-5 ${PLAN_ICON_COLOR[plan]}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mevcut Plan</p>
                    <h2 className="text-2xl font-bold leading-tight">{getPlanDisplayName(plan)}</h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className={`size-2 rounded-full ${statusCfg.dot} ${isActive ? "animate-pulse" : ""}`} />
                  <Badge variant="outline" className={`text-xs ${statusCfg.badgeCls}`}>
                    <StatusIcon className="size-3 mr-1" />
                    {statusCfg.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {billingPeriod === "annually" ? "Yıllık" : "Aylık"} fatura
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {PLAN_FEATURES[plan].map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-sm">
                      <Check className={`size-3.5 shrink-0 ${PLAN_ICON_COLOR[plan]}`} />
                      <span className="text-muted-foreground">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  {billingPeriod === "annually" ? "Yıllık tutar" : "Aylık tutar"}
                </p>
                {displayPrice > 0 ? (
                  <>
                    <p className="text-4xl font-bold tabular-nums">
                      {displayPrice.toLocaleString("tr-TR")}
                      <span className="text-xl font-normal text-muted-foreground"> ₺</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {billingPeriod === "annually" ? "/ yıl" : "/ ay"} + KDV
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-muted-foreground">Ücretsiz</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sağ: 3 küçük stat kart */}
        <div className="flex flex-col gap-4">
          <StatMini
            label="Üyelik Süresi"
            value={membershipDuration(activeCompany.subscription_started_at)}
            sub={activeCompany.subscription_started_at ? formatDate(activeCompany.subscription_started_at) : "Başlangıç tarihi yok"}
            icon={<Calendar className="size-4 text-sky-500" />}
            iconBg="bg-sky-500/10"
          />
          <StatMini
            label="Sonraki Yenileme"
            value={isActive && activeCompany.subscription_ends_at ? formatDate(activeCompany.subscription_ends_at) : "—"}
            sub={isActive ? "Otomatik yenileme" : "Aktif abonelik yok"}
            icon={<TrendingUp className="size-4 text-emerald-500" />}
            iconBg="bg-emerald-500/10"
          />
          <StatMini
            label="Son Ödeme"
            value={activeCompany.last_payment_at ? formatDate(activeCompany.last_payment_at) : "—"}
            sub={isActive ? "Abonelik aktif" : "Ödeme bekleniyor"}
            icon={<Zap className="size-4 text-amber-500" />}
            iconBg="bg-amber-500/10"
          />
        </div>
      </div>

      {/* ── Plan Değiştir ──────────────────────────────────── */}
      <PlanChangeSection
        companyId={activeCompany.id}
        currentPlan={plan}
        subscriptionStatus={subscriptionStatus}
      />

      {/* ── Ödeme Geçmişi ──────────────────────────────────── */}
      <PaymentHistoryCard />
    </div>
  )
}

function StatMini({
  label,
  value,
  sub,
  icon,
  iconBg,
}: {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  iconBg: string
}) {
  return (
    <div className="flex-1 rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
      <div className={`rounded-xl p-2.5 shrink-0 ${iconBg}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-foreground text-sm leading-snug truncate">{value}</p>
        <p className="text-xs text-muted-foreground truncate">{sub}</p>
      </div>
    </div>
  )
}
