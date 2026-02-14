"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { SubscriptionCard } from "@/components/company/SubscriptionCard"
import type { CompanyPlan, SubscriptionStatus, BillingPeriod } from "@/lib/types"
import { AlertCircle } from "lucide-react"

interface CompanyPaymentGateProps {
  children: ReactNode
  companyId: string
  subscriptionStatus: SubscriptionStatus | null
  plan: CompanyPlan
  billingPeriod: BillingPeriod
  lastPaymentAt?: string | null
  subscriptionEndsAt?: string | null
  currentPlanPrice?: number | null
}

export function CompanyPaymentGate({
  children,
  companyId,
  subscriptionStatus,
  plan,
  billingPeriod,
  lastPaymentAt,
  subscriptionEndsAt,
  currentPlanPrice,
}: CompanyPaymentGateProps) {
  const isPending = subscriptionStatus === "pending_payment"
  const [open, setOpen] = useState(isPending)

  useEffect(() => {
    setOpen(subscriptionStatus === "pending_payment")
  }, [subscriptionStatus])

  const handleOpenChange = (nextOpen: boolean) => {
    // Ödeme bekleniyorsa modali kapatmaya izin verme (bloklayıcı davranış)
    if (subscriptionStatus === "pending_payment") return
    setOpen(nextOpen)
  }

  return (
    <>
      <Dialog open={open && isPending} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ödeme Gerekli</DialogTitle>
            <DialogDescription>
              <span className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="mt-0.5 size-4 text-amber-500" />
                <span>
                  Şirket panelini tam olarak kullanabilmek için abonelik ödemenizi tamamlamanız gerekiyor. Ödemeyi
                  tamamladıktan sonra tüm özelliklere erişebilirsiniz.
                </span>
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <SubscriptionCard
              companyId={companyId}
              plan={plan}
              subscriptionStatus={subscriptionStatus ?? "pending_payment"}
              billingPeriod={billingPeriod}
              lastPaymentAt={lastPaymentAt}
              subscriptionEndsAt={subscriptionEndsAt}
              currentPlanPrice={currentPlanPrice ?? undefined}
            />
          </div>
        </DialogContent>
      </Dialog>

      {children}
    </>
  )
}

