"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
import { ArrowUpCircle, Loader2 } from "lucide-react"

import Link from "next/link"

const BILLING_LABELS: Record<BillingPeriod, string> = {
  monthly: "Aylık",
  annually: "Yıllık",
}

const PAID_PLANS: CompanyPlan[] = ["orta", "premium"]

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
  const [plan, setPlan] = useState<CompanyPlan>(currentPlan === "free" ? "orta" : currentPlan === "orta" ? "premium" : "orta")
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly")
  const [loading, setLoading] = useState(false)

  const isActive = subscriptionStatus === "active"
  const upgradePlans = PAID_PLANS.filter((p) => p !== currentPlan)
  const canUpgrade = upgradePlans.length > 0
  const isPaidPlan = currentPlan === "orta" || currentPlan === "premium"

  const handleUpgrade = async () => {
    if (plan === currentPlan) {
      toast({
        title: "Bilgi",
        description: "Zaten bu plandasınız.",
        variant: "destructive",
      })
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/company/start-mock-payment", {
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
          description:
            "Hesabınız için şifre değişikliği zorunlu görünüyor. Lütfen yeniden giriş yapıp şifrenizi güncelleyin.",
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

  const selectedPrice = getPlanPrice(plan, billingPeriod)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <ArrowUpCircle className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Plan Değiştir</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {canUpgrade && (
          <>
            <p className="text-sm text-muted-foreground">
              Daha fazla özellik için planınızı yükseltebilirsiniz.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Yeni plan</Label>
                <Select
                  value={plan}
                  onValueChange={(v) => setPlan(v as CompanyPlan)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {upgradePlans.map((p) => (
                      <SelectItem key={p} value={p}>
                        {getPlanDisplayName(p)} — {getPlanPrice(p, "monthly")} ₺/ay
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Faturalandırma dönemi</Label>
                <Select
                  value={billingPeriod}
                  onValueChange={(v) => setBillingPeriod(v as BillingPeriod)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">
                      {BILLING_LABELS.monthly} — {getPlanPrice(plan, "monthly")} ₺
                    </SelectItem>
                    <SelectItem value="annually">
                      {BILLING_LABELS.annually} — {getPlanPrice(plan, "annually")} ₺
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleUpgrade}
                disabled={loading || selectedPrice === 0}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : null}
                {selectedPrice > 0 ? `${selectedPrice} ₺ öde ve yükselt` : "Yükselt"}
              </Button>
            </div>
          </>
        )}
        {isPaidPlan && upgradePlans.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Şu an en yüksek plandasınız (Enterprise).
          </p>
        )}
        {isPaidPlan && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-muted-foreground">
            <strong className="text-foreground">Plan düşürmek</strong> (örn. Enterprise → Pro veya Basic) için
            destek talebi oluşturun. Dönem sonunda geçiş yapılabilir.
            <Link
              href="/dashboard/company/destek"
              className="ml-1 text-primary underline-offset-2 hover:underline"
            >
              Destek talebi oluştur
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
