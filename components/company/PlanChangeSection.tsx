"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getPlanPrice, getPlanDisplayName } from "@/lib/billing/plans"
import type { CompanyPlan, SubscriptionStatus, BillingPeriod } from "@/lib/types"
import { ArrowUpCircle, Loader2, Zap } from "lucide-react"
import Link from "next/link"

const BILLING_LABELS: Record<BillingPeriod, string> = {
  monthly: "Aylık",
  annually: "Yıllık (%20 indirim)",
}

const ALL_PAID_PLANS: CompanyPlan[] = ["orta", "premium"]

const PLAN_DESCRIPTIONS: Record<CompanyPlan, string> = {
  free: "Temel özellikler",
  orta: "Büyüyen ekipler için",
  premium: "Sınırsız + öncelikli destek",
}

export interface PlanChangeSectionProps {
  companyId: string
  currentPlan: CompanyPlan
  subscriptionStatus: SubscriptionStatus
}

export function PlanChangeSection({
  companyId,
  currentPlan,
  subscriptionStatus,
}: PlanChangeSectionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [plan, setPlan] = useState<CompanyPlan>(
    currentPlan === "free" ? "orta" : currentPlan === "orta" ? "premium" : "orta"
  )
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly")
  const [loading, setLoading] = useState(false)

  const isPaidPlan = currentPlan === "orta" || currentPlan === "premium"
  const selectedPrice = getPlanPrice(plan, billingPeriod)
  const monthlyPrice = getPlanPrice(plan, "monthly")
  const annualPrice = getPlanPrice(plan, "annually")
  const annualSaving = monthlyPrice * 12 - annualPrice

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/company/start-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, plan, billingPeriod }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast({
          title: "Hata",
          description: data.error ?? "Ödeme başlatılamadı",
          variant: "destructive",
        })
        return
      }
      if (data.mustChangePassword) {
        toast({
          title: "Güvenlik uyarısı",
          description: "Lütfen yeniden giriş yapıp şifrenizi güncelleyin.",
          variant: "destructive",
        })
        router.push("/auth/giris")
        return
      }
      if (data.paymentId) {
        router.push(`/dashboard/company/uyelik/odeme?paymentId=${data.paymentId}`)
        return
      }
      toast({
        title: "Ödeme tamamlandı",
        description: "Planınız güncellendi ve aboneliğiniz aktif.",
      })
      router.refresh()
    } catch {
      toast({
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="rounded-2xl border border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ArrowUpCircle className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Plan Değiştir</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Planınızı istediğiniz zaman yükseltebilirsiniz.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Yeni plan</Label>
            <Select
              value={plan}
              onValueChange={(v) => setPlan(v as CompanyPlan)}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_PAID_PLANS.map((p) => (
                  <SelectItem key={p} value={p} className="dark:bg-background dark:hover:bg-gray-800 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span>{getPlanDisplayName(p)}</span>
                      {p === currentPlan && (
                        <Badge variant="secondary" className="text-xs py-0 px-1.5">Mevcut</Badge>
                      )}
                      {p === "premium" && p !== currentPlan && (
                        <Badge className="text-xs py-0 px-1.5 bg-violet-600 text-white">Enterprise</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{PLAN_DESCRIPTIONS[plan]}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Faturalandırma</Label>
            <Select
              value={billingPeriod}
              onValueChange={(v) => setBillingPeriod(v as BillingPeriod)}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly" className="dark:bg-background dark:hover:bg-gray-800 cursor-pointer">
                  Aylık — {monthlyPrice.toLocaleString("tr-TR")} ₺
                </SelectItem>
                <SelectItem value="annually" className="dark:bg-background dark:hover:bg-gray-800 cursor-pointer">
                  Yıllık — {annualPrice.toLocaleString("tr-TR")} ₺
                </SelectItem>
              </SelectContent>
            </Select>
            {billingPeriod === "annually" && annualSaving > 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Zap className="size-3" />
                Yılda {annualSaving.toLocaleString("tr-TR")} ₺ tasarruf
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Ödenecek tutar</p>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {selectedPrice.toLocaleString("tr-TR")} ₺
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / {billingPeriod === "annually" ? "yıl" : "ay"}
              </span>
            </p>
          </div>
          <Button
            onClick={handleUpgrade}
            disabled={loading || selectedPrice === 0}
            size="lg"
            className="shrink-0"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : null}
            Ödeme Adımına Geç
          </Button>
        </div>

        {isPaidPlan && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Plana düşürmek</strong> için destek talebi oluşturun.{" "}
            <Link
              href="/dashboard/company/destek"
              className="text-primary underline-offset-2 hover:underline"
            >
              Destek talebi oluştur →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
