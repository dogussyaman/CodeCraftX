"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { SubscriptionStatus } from "@/lib/types"
import { AlertCircle, CreditCard } from "lucide-react"

interface CompanyPaymentGateProps {
  children: ReactNode
  subscriptionStatus: SubscriptionStatus | null
}

export function CompanyPaymentGate({
  children,
  subscriptionStatus,
}: CompanyPaymentGateProps) {
  const router = useRouter()
  const isPending = subscriptionStatus === "pending_payment"
  const [open, setOpen] = useState(isPending)

  useEffect(() => {
    setOpen(subscriptionStatus === "pending_payment")
  }, [subscriptionStatus])

  return (
    <>
      <Dialog open={open && isPending} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              Abonelik Gerekli
            </DialogTitle>
            <DialogDescription asChild>
              <span className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertCircle className="mt-0.5 size-4 text-amber-500 shrink-0" />
                <span>
                  Şirket panelini tam olarak kullanabilmek için bir abonelik planı seçip ödemenizi tamamlamanız gerekiyor.
                </span>
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 flex flex-col gap-3">
            <Button
              className="w-full"
              onClick={() => router.push("/dashboard/company/uyelik")}
            >
              <CreditCard className="size-4 mr-2" />
              Abonelik Planı Seç
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {children}
    </>
  )
}

