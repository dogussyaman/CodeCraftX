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
import {
  ArrowLeft,
  Check,
  Shield,
  Lock,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Wifi,
  CheckCircle2,
  Loader2,
} from "lucide-react"
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
  free: "border-zinc-300 dark:border-zinc-600",
  orta: "border-primary/30 dark:border-primary/40",
  premium: "border-violet-300 dark:border-violet-700",
}

const CHECK_COLOR: Record<CompanyPlan, string> = {
  free: "text-zinc-500",
  orta: "text-primary",
  premium: "text-violet-500",
}

export default function OdemePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<PaymentDetailsResponse | null>(null)
  const [mounted, setMounted] = useState(false)
  const [paymentState, setPaymentState] = useState<PaymentUiState>({ status: "idle" })
  const [useSavedCard, setUseSavedCard] = useState(true)
  const [savedCardLoading, setSavedCardLoading] = useState(false)
  const { toast } = useToast()

  const paymentId = searchParams.get("paymentId")

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !paymentId) {
      if (mounted && !paymentId) router.replace("/dashboard/company/uyelik")
      return
    }

    setPaymentState({ status: "loading" })

    fetch(`/api/company/payment-details?paymentId=${encodeURIComponent(paymentId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Ödeme bilgileri alınamadı")
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
        if (!res.ok) throw new Error(json?.error ?? "Ödeme başlatılamadı")
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
    toast({ title: "Ödeme alındı", description: "Aboneliğiniz aktif edildi." })
    router.refresh()
    router.replace("/dashboard/company/uyelik")
  }, [router, toast])

  const handleError = useCallback(
    (message: string) => {
      setPaymentState((prev) => prev.status === "ready" ? prev : { status: "error", message })
      toast({ title: "Ödeme hatası", description: message, variant: "destructive" })
    },
    [toast]
  )

  const handleSavedCardPay = async () => {
    if (!paymentId) return
    setSavedCardLoading(true)
    try {
      const res = await fetch("/api/payment/confirm-saved-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast({ title: "Ödeme hatası", description: json?.error ?? "İşlem başarısız", variant: "destructive" })
        return
      }
      handleSuccess()
    } catch {
      toast({ title: "Hata", description: "Beklenmeyen bir hata oluştu", variant: "destructive" })
    } finally {
      setSavedCardLoading(false)
    }
  }

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
  const annualSaving = billingPeriod === "annually" ? getPlanPrice(plan, "monthly") * 12 - amount : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Üst çubuk */}
      <div className="border-b border-border bg-background/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link href="/dashboard/company/uyelik" className="flex items-center gap-1.5 text-sm">
              <ArrowLeft className="size-4" />
              Geri
            </Link>
          </Button>
          <span className="text-muted-foreground/40">|</span>
          <span className="text-sm text-muted-foreground">Güvenli Ödeme</span>
          <Lock className="size-3.5 text-muted-foreground/60" />
          <Badge variant="outline" className="ml-auto text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
            TEST MODU
          </Badge>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">

          {/* Sol – Plan özeti */}
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">Seçilen plan</p>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{planDisplayName}</h1>
                {plan === "orta" && (
                  <Badge className="bg-primary text-primary-foreground text-xs">En Popüler</Badge>
                )}
                {plan === "premium" && (
                  <Badge className="bg-violet-600 text-white text-xs">Enterprise</Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1.5 text-sm">{PLAN_DESCRIPTIONS[plan]}</p>
            </div>

            {/* Fiyat kutusu */}
            <div className={`rounded-2xl border-2 p-6 bg-card ${PLAN_COLOR[plan]}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tabular-nums">
                      {amount.toLocaleString("tr-TR")} ₺
                    </span>
                    <span className="text-muted-foreground text-sm">
                      / {billingPeriod === "annually" ? "yıl" : "ay"}
                    </span>
                  </div>
                  {billingPeriod === "annually" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Aylık <span className="font-semibold text-foreground">{monthlyEquivalent.toLocaleString("tr-TR")} ₺</span> karşılığı
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant="outline" className="text-xs">
                    {billingPeriod === "annually" ? "Yıllık fatura" : "Aylık fatura"}
                  </Badge>
                  {annualSaving > 0 && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      Yılda {annualSaving.toLocaleString("tr-TR")} ₺ tasarruf
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{planDisplayName} aboneliği</span>
                  <span className="font-medium">{amount.toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">KDV</span>
                  <span className="text-muted-foreground">Dahil</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-border text-base">
                  <span>Toplam</span>
                  <span className="tabular-nums">{amount.toLocaleString("tr-TR")} ₺</span>
                </div>
              </div>
            </div>

            {/* Özellikler */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Dahil özellikler</p>
              <ul className="space-y-2.5">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <Check className={`size-4 mt-0.5 shrink-0 ${CHECK_COLOR[plan]}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Güvenlik */}
            <div className="rounded-xl border border-border bg-card px-5 py-4 space-y-2.5">
              <SecurityRow icon={<Shield className="size-3.5 text-emerald-500" />} text="256-bit SSL şifreleme ile güvenli ödeme" />
              <SecurityRow icon={<Lock className="size-3.5 text-emerald-500" />} text="Kart bilgileriniz sunucularımızda saklanmaz" />
              <SecurityRow icon={<CreditCard className="size-3.5 text-muted-foreground/50" />} text="Visa, Mastercard ve taksitli ödeme desteklenir" />
            </div>
          </div>

          {/* Sağ – Ödeme alanı */}
          <div className="lg:sticky lg:top-20 space-y-4">
            {paymentState.status === "loading" && (
              <div className="rounded-2xl border border-border bg-card p-10 flex flex-col items-center justify-center gap-4">
                <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">Ödeme formu hazırlanıyor…</p>
              </div>
            )}

            {paymentState.status === "success" && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
                <CheckCircle2 className="size-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-semibold text-foreground">Ödeme alındı</p>
                <p className="text-sm text-muted-foreground mt-1">Aboneliğiniz aktif edildi.</p>
                <Button variant="outline" size="sm" asChild className="mt-5">
                  <Link href="/dashboard/company/uyelik">Üyelik sayfasına dön</Link>
                </Button>
              </div>
            )}

            {paymentState.status === "error" && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {paymentState.message}
              </div>
            )}

            {paymentState.status === "ready" && (
              <div className="space-y-4">
                {/* ── Kayıtlı Test Kartı ── */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`size-4 rounded-full border-2 transition-colors ${useSavedCard ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                      <span className="text-sm font-semibold">Kayıtlı Test Kartı</span>
                    </div>
                    <Badge variant="outline" className="text-xs text-primary border-primary/30 bg-primary/5">
                      TEST
                    </Badge>
                  </div>

                  {/* Kredi Kartı Görseli */}
                  <div className="px-5 py-5">
                    <div className="relative rounded-2xl overflow-hidden h-44 bg-linear-to-br from-slate-700 via-slate-800 to-slate-900 p-5 text-white shadow-lg select-none">
                      {/* Dekoratif arka plan */}
                      <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/5" />
                      <div className="absolute -right-4 top-10 size-28 rounded-full bg-white/5" />

                      <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col gap-0.5">
                            <p className="text-[10px] text-white/50 font-medium uppercase tracking-widest">Test Kartı</p>
                            <Wifi className="size-5 text-white/70 rotate-90" />
                          </div>
                          <div className="flex gap-1">
                            <div className="size-7 rounded-full bg-red-400/80" />
                            <div className="size-7 rounded-full bg-amber-400/80 -ml-3" />
                          </div>
                        </div>
                        <div>
                          <p className="font-mono text-lg tracking-[0.2em] font-semibold text-white">
                            4242 4242 4242 4242
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <p className="text-[9px] text-white/50 uppercase">Son Kullanma</p>
                              <p className="font-mono text-sm font-semibold">12 / 34</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-white/50 uppercase">CVC</p>
                              <p className="font-mono text-sm font-semibold">123</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold tracking-tight opacity-90">VISA</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {useSavedCard && (
                    <div className="px-5 pb-5">
                      <Button
                        onClick={handleSavedCardPay}
                        disabled={savedCardLoading}
                        size="lg"
                        className="w-full gap-2"
                      >
                        {savedCardLoading ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            İşleniyor…
                          </>
                        ) : (
                          <>
                            <CreditCard className="size-4" />
                            Kayıtlı Kart ile Öde — {amount.toLocaleString("tr-TR")} ₺
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* ── Farklı kart aç/kapa ── */}
                <button
                  type="button"
                  onClick={() => setUseSavedCard((v) => !v)}
                  className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  {useSavedCard ? (
                    <>
                      <ChevronDown className="size-3.5" />
                      Farklı kart kullan
                    </>
                  ) : (
                    <>
                      <ChevronUp className="size-3.5" />
                      Kayıtlı karta dön
                    </>
                  )}
                </button>

                {/* ── Stripe PaymentElement (farklı kart) ── */}
                {!useSavedCard && stripePromise && paymentState.clientSecret && (
                  <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <CreditCard className="size-4 text-muted-foreground" />
                      <h3 className="font-semibold text-sm">Farklı Kart ile Öde</h3>
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
                            ".Input:focus": {
                              border: "1px solid hsl(var(--ring))",
                              boxShadow: "0 0 0 2px hsl(var(--ring) / 0.2)",
                            },
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SecurityRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
      {icon}
      <span>{text}</span>
    </div>
  )
}
