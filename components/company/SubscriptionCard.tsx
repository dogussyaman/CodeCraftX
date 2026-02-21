"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getPlanPrice, getPlanDisplayName } from "@/lib/billing/plans"
import type { CompanyPlan, SubscriptionStatus, BillingPeriod } from "@/lib/types"
import { CreditCard, Loader2 } from "lucide-react"

const PAYMENT_STORAGE_KEY = "iyzico_checkout"

const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  pending_payment: "Ödeme Bekleniyor",
  active: "Aktif",
  past_due: "Ödeme Gecikmiş",
  cancelled: "İptal",
}

const PLAN_LABELS: Record<CompanyPlan, string> = {
  free: "Free",
  orta: "Orta",
  premium: "Premium",
}

const BILLING_LABELS: Record<BillingPeriod, string> = {
  monthly: "Aylık",
  annually: "Yıllık",
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

export interface SubscriptionCardProps {
  companyId: string
  plan?: CompanyPlan
  subscriptionStatus?: SubscriptionStatus
  billingPeriod?: BillingPeriod
  lastPaymentAt?: string | null
  subscriptionEndsAt?: string | null
  currentPlanPrice?: number
}

export function SubscriptionCard({
  companyId,
  plan = "free",
  subscriptionStatus = "pending_payment",
  billingPeriod = "monthly",
  lastPaymentAt,
  subscriptionEndsAt,
  currentPlanPrice,
}: SubscriptionCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const isActive = subscriptionStatus === "active"
  const isPending = subscriptionStatus === "pending_payment"
  const amount = currentPlanPrice ?? getPlanPrice(plan, billingPeriod)

  const handleStartPayment = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/company/start-mock-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
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
      if (data.checkoutFormContent) {
        const payload = {
          checkoutFormContent: data.checkoutFormContent,
          plan,
          billingPeriod,
          amount,
          planDisplayName: getPlanDisplayName(plan),
        }
        try {
          sessionStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payload))
        } catch {
          // ignore
        }
        router.push(`/dashboard/company/uyelik/odeme?plan=${plan}&billing=${billingPeriod}&amount=${amount}`)
        return
      }
      toast({
        title: "Ödeme tamamlandı",
        description: "Aboneliğiniz aktif edildi.",
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
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CreditCard className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Abonelik</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-muted-foreground">Plan:</span>
          <span>{PLAN_LABELS[plan]}</span>
          <span className="text-muted-foreground">·</span>
          <span className="font-medium text-muted-foreground">Faturalandırma:</span>
          <span>{BILLING_LABELS[billingPeriod]}</span>
          {currentPlanPrice != null && currentPlanPrice > 0 && (
            <>
              <span className="text-muted-foreground">·</span>
              <span>{currentPlanPrice} ₺</span>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Durum: {SUBSCRIPTION_STATUS_LABELS[subscriptionStatus]}</span>
          {lastPaymentAt && (
            <>
              <span>·</span>
              <span>Son ödeme: {formatDate(lastPaymentAt)}</span>
            </>
          )}
          {subscriptionEndsAt && isActive && (
            <>
              <span>·</span>
              <span>Bitiş: {formatDate(subscriptionEndsAt)}</span>
            </>
          )}
        </div>
        {isPending && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-2">
              Aboneliğinizi başlatmak için ödemeyi tamamlayın.
            </p>
            <Button
              onClick={handleStartPayment}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              Ödemeyi Tamamla
            </Button>
          </div>
        )}
        {isActive && (
          <p className="text-sm text-muted-foreground pt-1">
            Planınız aktif.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
