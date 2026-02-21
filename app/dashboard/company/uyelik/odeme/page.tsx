"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { IyzicoCheckoutForm } from "@/components/company/IyzicoCheckoutForm"
import { getPlanDisplayName, getPlanPrice } from "@/lib/billing/plans"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CompanyPlan } from "@/lib/types"
import type { BillingPeriod } from "@/lib/payments/types"
import { ArrowLeft, Check, Shield, Lock, CreditCard } from "lucide-react"

const STORAGE_KEY = "iyzico_checkout"

interface StoredCheckout {
  checkoutFormContent: string
  plan: CompanyPlan
  billingPeriod: BillingPeriod
  amount: number
  planDisplayName: string
}

interface PaymentDetailsResponse {
  plan: CompanyPlan
  billingPeriod: BillingPeriod
  amount: number
  planDisplayName: string
  currency?: string
}

const PLAN_DESCRIPTIONS: Record<CompanyPlan, string> = {
  free: "Bireyler ve küçük projeler için ideal",
  orta: "Büyüyen takımlar ve işletmeler için",
  premium: "Büyük kurumlar ve ileri düzey ihtiyaçlar için",
}

const PLAN_FEATURES: Record<CompanyPlan, string[]> = {
  free: [
    "En fazla 5 aktif ilan",
    "Temel başvuru yönetimi",
    "E-posta destek",
    "Temel analitik",
  ],
  orta: [
    "100 aktif ilan hakkı",
    "10 İK çalışanına kadar",
    "Gelişmiş başvuru yönetimi",
    "Canlı destek + öncelikli yanıt",
    "Detaylı analitik ve raporlar",
    "AI tabanlı aday eşleştirme",
  ],
  premium: [
    "Sınırsız aktif ilan",
    "Sınırsız İK çalışanı",
    "7/24 premium destek",
    "Özel hesap yöneticisi",
    "API erişimi (entegrasyon)",
    "White-label / özelleştirme",
    "Öncelikli aday önerileri",
  ],
}

const PLAN_COLOR: Record<CompanyPlan, string> = {
  free:    "bg-zinc-100   dark:bg-zinc-800/60   border-zinc-300   dark:border-zinc-600",
  orta:    "bg-accent-50  dark:bg-accent-900/20  border-accent-300  dark:border-accent-700",
  premium: "bg-violet-50  dark:bg-violet-900/20  border-violet-300  dark:border-violet-700",
}

const PLAN_DIVIDER: Record<CompanyPlan, string> = {
  free:    "border-zinc-200   dark:border-zinc-700",
  orta:    "border-accent-200  dark:border-accent-800",
  premium: "border-violet-200  dark:border-violet-800",
}

const PLAN_BADGE_COLOR: Record<CompanyPlan, string> = {
  free:    "bg-zinc-200   text-zinc-700   dark:bg-zinc-700   dark:text-zinc-200   border-zinc-300   dark:border-zinc-600",
  orta:    "bg-accent-100  text-accent-700  dark:bg-accent-900/50 dark:text-accent-300  border-accent-300  dark:border-accent-700",
  premium: "bg-violet-100  text-violet-700  dark:bg-violet-900/50 dark:text-violet-300  border-violet-300  dark:border-violet-700",
}

const CHECK_COLOR: Record<CompanyPlan, string> = {
  free:    "text-zinc-500   dark:text-zinc-400",
  orta:    "text-accent-500  dark:text-accent-400",
  premium: "text-violet-500  dark:text-violet-400",
}

export default function OdemePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<StoredCheckout | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const paymentId = searchParams.get("paymentId")
    const planParam = (searchParams.get("plan") as CompanyPlan) || "orta"
    const billingParam = (searchParams.get("billing") as BillingPeriod) || "monthly"
    const amountParam = searchParams.get("amount")
    const amountFromQuery = amountParam ? Number(amountParam) : 0

    const applyStoredOrFallback = (checkoutFormContent: string, details: { plan: CompanyPlan; billingPeriod: BillingPeriod; amount: number; planDisplayName: string }) => {
      setData({
        checkoutFormContent,
        plan: details.plan,
        billingPeriod: details.billingPeriod,
        amount: details.amount,
        planDisplayName: details.planDisplayName,
      })
    }

    if (paymentId) {
      fetch(`/api/company/payment-details?paymentId=${encodeURIComponent(paymentId)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Payment details not found")
          return res.json() as Promise<PaymentDetailsResponse>
        })
        .then((api) => {
          const raw = typeof window !== "undefined" ? window.sessionStorage.getItem(STORAGE_KEY) : null
          let checkoutFormContent = ""
          try {
            const stored = raw ? JSON.parse(raw) : null
            checkoutFormContent = stored?.checkoutFormContent ?? ""
          } catch {
            // ignore
          }
          applyStoredOrFallback(checkoutFormContent, {
            plan: api.plan,
            billingPeriod: api.billingPeriod,
            amount: api.amount,
            planDisplayName: api.planDisplayName,
          })
        })
        .catch(() => {
          router.replace("/dashboard/company/uyelik")
        })
      return
    }

    try {
      const raw = typeof window !== "undefined" ? window.sessionStorage.getItem(STORAGE_KEY) : null
      const stored: StoredCheckout | null = raw ? JSON.parse(raw) : null
      if (stored?.checkoutFormContent) {
        setData({
          checkoutFormContent: stored.checkoutFormContent,
          plan: stored.plan || planParam,
          billingPeriod: stored.billingPeriod || billingParam,
          amount: stored.amount ?? amountFromQuery,
          planDisplayName: stored.planDisplayName || getPlanDisplayName(planParam),
        })
        return
      }
    } catch {
      // ignore
    }
    if (amountFromQuery > 0) {
      setData({
        checkoutFormContent: "",
        plan: planParam,
        billingPeriod: billingParam,
        amount: amountFromQuery,
        planDisplayName: getPlanDisplayName(planParam),
      })
      return
    }
    router.replace("/dashboard/company/uyelik")
  }, [mounted, searchParams, router])

  if (!mounted || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Yükleniyor…</p>
        </div>
      </div>
    )
  }

  const { plan, billingPeriod, amount, planDisplayName, checkoutFormContent } = data
  const features = PLAN_FEATURES[plan] ?? []
  const monthlyEquivalent = billingPeriod === "annually" ? Math.round(amount / 12) : amount
  const annualSaving =
    billingPeriod === "annually"
      ? getPlanPrice(plan, "monthly") * 12 - amount
      : 0

  return (
    <div className="min-h-screen bg-background">
      <div>
        test kartı: 5528790000000008, 12/30, 123.
        test kartı: 5528790000000009, 12/30, 123.
      </div>
      {/* Top bar */}
      <div className="border-b border-border bg-background/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link href="/dashboard/company/uyelik" className="flex items-center gap-1.5 text-sm">
              <ArrowLeft className="size-4" />
              Üyelik sayfasına dön
            </Link>
          </Button>
          <span className="text-muted-foreground/40 select-none">|</span>
          <span className="text-sm text-muted-foreground">Güvenli Ödeme</span>
          <Lock className="size-3.5 text-muted-foreground/60" />
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* SOL: Plan detayları */}
          <div className="space-y-6">
            {/* Plan başlık */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Seçilen plan</p>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{planDisplayName}</h1>
                {plan === "orta" && (
                  <Badge className="bg-accent-500 text-white hover:bg-accent-600 text-xs">En Popüler</Badge>
                )}
                {plan === "premium" && (
                  <Badge className="bg-violet-600 text-white hover:bg-violet-700 text-xs">Enterprise</Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1.5">{PLAN_DESCRIPTIONS[plan]}</p>
            </div>

            {/* Fiyat kartı */}
            <div className={`rounded-2xl border-2 p-6 ${PLAN_COLOR[plan]}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tabular-nums text-foreground">{amount.toLocaleString("tr-TR")} ₺</span>
                    <span className="text-muted-foreground text-sm">
                      / {billingPeriod === "annually" ? "yıl" : "ay"}
                    </span>
                  </div>
                  {billingPeriod === "annually" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Aylık <span className="font-semibold text-foreground">{monthlyEquivalent.toLocaleString("tr-TR")} ₺</span> — Yıllık fatura
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${PLAN_BADGE_COLOR[plan]}`}>
                    {billingPeriod === "annually" ? "Yıllık fatura" : "Aylık fatura"}
                  </span>
                  {annualSaving > 0 && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      Yılda {annualSaving.toLocaleString("tr-TR")} ₺ tasarruf
                    </span>
                  )}
                </div>
              </div>

              {/* Fatura özeti */}
              <div className={`mt-5 pt-5 border-t ${PLAN_DIVIDER[plan]} space-y-2`}>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{planDisplayName} aboneliği</span>
                  <span className="font-medium text-foreground">{amount.toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">KDV</span>
                  <span className="text-muted-foreground">Fiyatlara dahildir</span>
                </div>
                <div className={`flex justify-between font-semibold pt-2 border-t ${PLAN_DIVIDER[plan]} text-base text-foreground`}>
                  <span>Toplam ödenecek</span>
                  <span className="tabular-nums">{amount.toLocaleString("tr-TR")} ₺</span>
                </div>
              </div>
            </div>

            {/* Plan özellikleri */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                {plan === "free" ? "Neler dahil:" : plan === "orta" ? "Basic dahil, artı:" : "Pro dahil, artı:"}
              </h2>
              <ul className="space-y-3">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className={`size-4 mt-0.5 shrink-0 ${CHECK_COLOR[plan]}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Güvenlik notları */}
            <div className="rounded-xl border border-border bg-card px-5 py-4 flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Shield className="size-3.5 shrink-0 text-emerald-500 dark:text-emerald-400" />
                <span>Ödeme iyzico güvenli altyapısı ile 256-bit SSL şifrelenerek alınmaktadır.</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Lock className="size-3.5 shrink-0 text-emerald-500 dark:text-emerald-400" />
                <span>Kart bilgileriniz hiçbir zaman sunucularımızda saklanmaz.</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <CreditCard className="size-3.5 shrink-0 text-muted-foreground/50" />
                <span>Visa, Mastercard, Troy ve taksitli ödeme desteklenmektedir.</span>
              </div>
            </div>
          </div>

          {/* SAĞ: iyzico ödeme formu — wrapper yok, doğrudan render */}
          <div className="lg:sticky lg:top-20">
            {checkoutFormContent ? (
              <IyzicoCheckoutForm
                checkoutFormContent={checkoutFormContent}
                className="min-h-[560px] w-full"
              />
            ) : (
              <div className="min-h-[320px] flex flex-col items-center justify-center gap-3 text-center text-muted-foreground rounded-xl border border-dashed p-8">
                <CreditCard className="size-10 opacity-30" />
                <p className="text-sm">
                  Ödeme formu yüklenemedi. Lütfen üyelik sayfasından tekrar &quot;Öde ve yükselt&quot; ile deneyin.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/company/uyelik">Geri dön</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
