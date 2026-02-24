"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { getPlanDisplayName, getPlanPrice } from "@/lib/billing/plans"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CompanyPlan } from "@/lib/types"
import type { BillingPeriod } from "@/lib/payments/types"
import { ArrowLeft, Check, Shield, Lock, CreditCard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { StripeCheckout } from "@/components/StripeCheckout"

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

interface PaymentDetailsResponse {
  plan: CompanyPlan
  billingPeriod: BillingPeriod
  amount: number
  planDisplayName: string
  currency?: string
}

type PaymentUiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; clientSecret: string }
  | { status: "success" }
  | { status: "error"; message: string }

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
  free: "bg-zinc-100 dark:bg-zinc-800/60 border-zinc-300 dark:border-zinc-600",
  orta: "bg-accent-50 dark:bg-accent-900/20 border-accent-300 dark:border-accent-700",
  premium: "bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700",
}

const PLAN_DIVIDER: Record<CompanyPlan, string> = {
  free: "border-zinc-200 dark:border-zinc-700",
  orta: "border-accent-200 dark:border-accent-800",
  premium: "border-violet-200 dark:border-violet-800",
}

const PLAN_BADGE_COLOR: Record<CompanyPlan, string> = {
  free: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200 border-zinc-300 dark:border-zinc-600",
  orta: "bg-accent-100 text-accent-700 dark:bg-accent-900/50 dark:text-accent-300 border-accent-300 dark:border-accent-700",
  premium: "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 border-violet-300 dark:border-violet-700",
}

const CHECK_COLOR: Record<CompanyPlan, string> = {
  free: "text-zinc-500 dark:text-zinc-400",
  orta: "text-accent-500 dark:text-accent-400",
  premium: "text-violet-500 dark:text-violet-400",
}

export default function OdemePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<PaymentDetailsResponse | null>(null)
  const [mounted, setMounted] = useState(false)
  const [paymentState, setPaymentState] = useState<PaymentUiState>({ status: "idle" })
  const { toast } = useToast()

  const paymentId = searchParams.get("paymentId")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !paymentId) {
      if (mounted && !paymentId) {
        router.replace("/dashboard/company/uyelik")
      }
      return
    }

    setPaymentState({ status: "loading" })

    fetch(`/api/company/payment-details?paymentId=${encodeURIComponent(paymentId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Payment details not found")
        return res.json() as Promise<PaymentDetailsResponse>
      })
      .then((details) => {
        setData(details)
        const idempotencyKey = `stripe-${paymentId}`
        return fetch("/api/payment/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, idempotencyKey }),
        }).then((res) => res.json().then((json) => ({ res, json })))
      })
      .then(({ res, json }) => {
        if (!res.ok) {
          throw new Error(json?.error ?? "Ödeme başlatılamadı")
        }
        if (json.clientSecret) {
          setPaymentState({ status: "ready", clientSecret: json.clientSecret })
        } else {
          throw new Error("Client secret alınamadı")
        }
      })
      .catch((err) => {
        setPaymentState({
          status: "error",
          message: err instanceof Error ? err.message : "Yükleme hatası",
        })
        router.replace("/dashboard/company/uyelik")
      })
  }, [mounted, paymentId, router])

  const handleSuccess = useCallback(() => {
    setPaymentState({ status: "success" })
    toast({
      title: "Ödeme alındı",
      description: "Ödemeniz onaylandı, aboneliğiniz aktif edildi.",
    })
    router.replace("/dashboard/company/uyelik")
  }, [router, toast])

  const handleError = useCallback(
    (message: string) => {
      setPaymentState({ status: "error", message })
      toast({
        title: "Ödeme hatası",
        description: message,
        variant: "destructive",
      })
    },
    [toast]
  )

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

  const { plan, billingPeriod, amount, planDisplayName } = data
  const features = PLAN_FEATURES[plan] ?? []
  const monthlyEquivalent = billingPeriod === "annually" ? Math.round(amount / 12) : amount
  const annualSaving =
    billingPeriod === "annually"
      ? getPlanPrice(plan, "monthly") * 12 - amount
      : 0

  return (
    <div className="min-h-screen bg-background">
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
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Seçilen plan</p>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{planDisplayName}</h1>
                {plan === "orta" && (
                  <Badge className="bg-accent-500 text-white hover:bg-accent-600 text-xs">
                    En Popüler
                  </Badge>
                )}
                {plan === "premium" && (
                  <Badge className="bg-violet-600 text-white hover:bg-violet-700 text-xs">
                    Enterprise
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1.5">{PLAN_DESCRIPTIONS[plan]}</p>
            </div>

            <div className={`rounded-2xl border-2 p-6 ${PLAN_COLOR[plan]}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold tabular-nums text-foreground">
                      {amount.toLocaleString("tr-TR")} ₺
                    </span>
                    <span className="text-muted-foreground text-sm">
                      / {billingPeriod === "annually" ? "yıl" : "ay"}
                    </span>
                  </div>
                  {billingPeriod === "annually" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Aylık{" "}
                      <span className="font-semibold text-foreground">
                        {monthlyEquivalent.toLocaleString("tr-TR")} ₺
                      </span>{" "}
                      — Yıllık fatura
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${PLAN_BADGE_COLOR[plan]}`}
                  >
                    {billingPeriod === "annually" ? "Yıllık fatura" : "Aylık fatura"}
                  </span>
                  {annualSaving > 0 && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      Yılda {annualSaving.toLocaleString("tr-TR")} ₺ tasarruf
                    </span>
                  )}
                </div>
              </div>

              <div className={`mt-5 pt-5 border-t ${PLAN_DIVIDER[plan]} space-y-2`}>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{planDisplayName} aboneliği</span>
                  <span className="font-medium text-foreground">
                    {amount.toLocaleString("tr-TR")} ₺
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">KDV</span>
                  <span className="text-muted-foreground">Fiyatlara dahildir</span>
                </div>
                <div
                  className={`flex justify-between font-semibold pt-2 border-t ${PLAN_DIVIDER[plan]} text-base text-foreground`}
                >
                  <span>Toplam ödenecek</span>
                  <span className="tabular-nums">{amount.toLocaleString("tr-TR")} ₺</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h2 className="font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                {plan === "free"
                  ? "Neler dahil:"
                  : plan === "orta"
                    ? "Basic dahil, artı:"
                    : "Pro dahil, artı:"}
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

            <div className="rounded-xl border border-border bg-card px-5 py-4 flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Shield className="size-3.5 shrink-0 text-emerald-500 dark:text-emerald-400" />
                <span>
                  Ödeme Stripe güvenli altyapısı ile 256-bit SSL şifrelenerek alınmaktadır.
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Lock className="size-3.5 shrink-0 text-emerald-500 dark:text-emerald-400" />
                <span>Kart bilgileriniz hiçbir zaman sunucularımızda saklanmaz.</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <CreditCard className="size-3.5 shrink-0 text-muted-foreground/50" />
                <span>Visa, Mastercard ve taksitli ödeme desteklenmektedir.</span>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-20">
            {paymentState.status === "loading" && (
              <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center justify-center gap-4 min-h-[280px]">
                <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-base font-medium text-foreground">Ödeme formu hazırlanıyor…</p>
              </div>
            )}

            {paymentState.status === "success" && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
                <div className="flex items-center gap-2">
                  <Check className="size-5" />
                  <span>Ödeme alındı. Aboneliğiniz güncellendi.</span>
                </div>
                <Button variant="outline" size="sm" asChild className="mt-4">
                  <Link href="/dashboard/company/uyelik">Üyelik sayfasına dön</Link>
                </Button>
              </div>
            )}

            {paymentState.status === "error" && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {paymentState.message}
              </div>
            )}

            {paymentState.status === "ready" &&
              stripePromise &&
              paymentState.clientSecret && (
                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <CreditCard className="size-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Ödeme Bilgileri</h3>
                    <span className="ml-auto text-xs text-muted-foreground">Test Modu</span>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
                    Test kartı: <strong>4242 4242 4242 4242</strong> · Tarih: <strong>herhangi gelecek tarih</strong> · CVC: <strong>herhangi 3 hane</strong>
                  </div>
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret: paymentState.clientSecret,
                      appearance: {
                        theme: "stripe",
                        variables: { borderRadius: "8px", fontFamily: "inherit" },
                        rules: {
                          ".Input": { border: "1px solid hsl(var(--border))", boxShadow: "none" },
                          ".Input:focus": { border: "1px solid hsl(var(--ring))", boxShadow: "0 0 0 2px hsl(var(--ring) / 0.2)" },
                        },
                      },
                    }}
                  >
                    <StripeCheckout
                      amount={amount}
                      paymentId={paymentId ?? ""}
                      onSuccess={handleSuccess}
                      onError={handleError}
                    />
                  </Elements>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
