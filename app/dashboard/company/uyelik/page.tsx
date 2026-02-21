import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SubscriptionCard } from "@/components/company/SubscriptionCard"
import { PlanChangeSection } from "@/components/company/PlanChangeSection"
import { PaymentCallbackHandler } from "@/components/company/PaymentCallbackHandler"
import { getPlanPrice, getPlanDisplayName } from "@/lib/billing/plans"
import type { CompanyPlan, SubscriptionStatus, BillingPeriod } from "@/lib/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, Calendar, Check, Sparkles } from "lucide-react"

const PLAN_DESCRIPTIONS: Record<CompanyPlan, string> = {
  free: "Temel özellikler, 5 ilan hakkı",
  orta: "Büyüyen ekipler için, 100 ilan",
  premium: "Sınırsız ilan ve öncelikli destek",
}

const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  pending_payment: "Ödeme Bekleniyor",
  active: "Aktif",
  past_due: "Ödeme Gecikmiş",
  cancelled: "İptal",
}

const PREMIUM_FEATURES = [
  "Sınırsız ilan hakkı",
  "Sınırsız İK çalışanı",
  "7/24 premium destek",
  "Özel hesap yöneticisi",
  "API erişimi",
  "White-label / özelleştirme seçenekleri",
]

const STATUS_LABELS: Record<string, string> = {
  pending: "Beklemede",
  success: "Başarılı",
  failed: "Başarısız",
}

const PROVIDER_LABELS: Record<string, string> = {
  mock: "Test",
  iyzico: "Kart (iyzico)",
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-"
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return "-"
  }
}

function membershipDuration(startedAt: string | null | undefined): string {
  if (!startedAt) return "-"
  try {
    const start = new Date(startedAt)
    const now = new Date()
    const months = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()))
    if (months < 1) return "1 aydan kısa"
    if (months === 1) return "1 ay"
    if (months < 12) return `${months} ay`
    const years = Math.floor(months / 12)
    const m = months % 12
    if (m === 0) return years === 1 ? "1 yıl" : `${years} yıl`
    return `${years} yıl ${m} ay`
  } catch {
    return "-"
  }
}

export default async function CompanyUyelikPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/giris")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single()

  if (!profile?.company_id) {
    redirect("/dashboard/company")
  }

  const allowedRoles = ["company_admin", "hr"]
  if (!profile.role || !allowedRoles.includes(profile.role)) {
    redirect("/dashboard/company")
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, plan, subscription_status, billing_period, current_plan_price, last_payment_at, subscription_ends_at, subscription_started_at")
    .eq("id", profile.company_id)
    .single()

  if (companyError || !company) {
    redirect("/dashboard/company")
  }

  const { data: payments } = await supabase
    .from("company_payments")
    .select("id, plan, billing_period, amount, status, provider, paid_at, created_at")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .limit(10)

  const plan = (company.plan as CompanyPlan) ?? "free"
  const subscriptionStatus = (company.subscription_status as SubscriptionStatus) ?? "pending_payment"
  const billingPeriod = (company.billing_period as BillingPeriod) ?? "monthly"

  const displayPrice = company.current_plan_price ?? getPlanPrice(plan, billingPeriod)
  const isActive = subscriptionStatus === "active"

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-6xl">
      <Suspense fallback={null}>
        <PaymentCallbackHandler />
      </Suspense>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Üyelik Merkezi</h1>
        <p className="text-muted-foreground mt-1">
          Aboneliğinizi görüntüleyin, plan değiştirin ve ödeme geçmişinize bakın.
        </p>
      </div>

      {/* Mevcut plan – büyük ve modern */}
      <Card className="rounded-2xl border-2 border-primary/20 from-primary/5 via-card to-card dark:from-primary/10 dark:via-card dark:to-card overflow-hidden">
        <CardContent className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Mevcut plan
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-1">
                {getPlanDisplayName(plan)}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-md">
                {PLAN_DESCRIPTIONS[plan]}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className={
                    isActive
                      ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30"
                      : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                  }
                >
                  {SUBSCRIPTION_STATUS_LABELS[subscriptionStatus]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {billingPeriod === "annually" ? "Yıllık faturalandırma" : "Aylık faturalandırma"}
                </span>
              </div>
            </div>
            <div className="text-center md:text-right shrink-0">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {billingPeriod === "annually" ? "Yıllık tutar" : "Aylık tutar"}
              </p>
              <p className="text-4xl md:text-5xl font-bold text-primary mt-1 tabular-nums">
                {displayPrice > 0 ? (
                  <>
                    {displayPrice.toLocaleString("tr-TR")}
                    <span className="text-2xl font-semibold text-muted-foreground"> ₺</span>
                  </>
                ) : (
                  <span className="text-2xl font-semibold text-muted-foreground">Ücretsiz</span>
                )}
              </p>
              {displayPrice > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {billingPeriod === "annually" ? "yıllık" : "aylık"} + KDV
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enterprise ayrıcalıkları */}
      <Card className="rounded-2xl border border-amber-500/20  from-amber-500/5 via-card to-card dark:from-amber-500/10 dark:via-card dark:to-card overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-xl font-semibold">Enterprise ayrıcalıkları</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Enterprise plana geçerek aşağıdaki özelliklerin tamamına erişin.
          </p>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Check className="size-3.5" />
                </span>
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <SubscriptionCard
        companyId={company.id}
        plan={plan}
        subscriptionStatus={subscriptionStatus}
        billingPeriod={billingPeriod}
        lastPaymentAt={company.last_payment_at}
        subscriptionEndsAt={company.subscription_ends_at}
        currentPlanPrice={company.current_plan_price}
      />

      <PlanChangeSection
        companyId={company.id}
        currentPlan={plan}
        subscriptionStatus={subscriptionStatus}
      />

      <Card className="rounded-2xl border border-border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Üyelik özeti</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Üyelik süresi</span>
            <span className="font-medium">{membershipDuration(company.subscription_started_at)}</span>
          </div>
          {company.subscription_started_at && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Üyelik başlangıcı</span>
              <span>{formatDate(company.subscription_started_at)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <History className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Ödeme geçmişi</h2>
          </div>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Tarih</th>
                    <th className="pb-3 pr-4 font-medium">Plan</th>
                    <th className="pb-3 pr-4 font-medium">Dönem</th>
                    <th className="pb-3 pr-4 font-medium">Tutar</th>
                    <th className="pb-3 pr-4 font-medium">Ödeme yöntemi</th>
                    <th className="pb-3 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        {p.paid_at ? formatDate(p.paid_at) : formatDate(p.created_at)}
                      </td>
                      <td className="py-3 pr-4 font-medium">{getPlanDisplayName(p.plan as CompanyPlan)}</td>
                      <td className="py-3 pr-4">{p.billing_period === "annually" ? "Yıllık" : "Aylık"}</td>
                      <td className="py-3 pr-4 font-medium tabular-nums">{p.amount} ₺</td>
                      <td className="py-3 pr-4 text-muted-foreground">{PROVIDER_LABELS[p.provider] ?? p.provider ?? "—"}</td>
                      <td className="py-3">{STATUS_LABELS[p.status] ?? p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">Henüz ödeme kaydı bulunmuyor.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
