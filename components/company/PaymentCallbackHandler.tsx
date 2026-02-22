"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

/**
 * Handles payment callback params on uyelik page.
 * - payment_success=1: Stripe 3DS redirect; webhook already updated DB, just show toast.
 */
export function PaymentCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const handled = useRef(false)

  useEffect(() => {
    const paymentSuccess = searchParams.get("payment_success")
    if (paymentSuccess !== "1" || handled.current) return
    handled.current = true

    toast({
      title: "Ödeme alındı",
      description: "Ödemeniz onaylandı, aboneliğiniz aktif edildi.",
    })
    router.replace("/dashboard/company/uyelik", { scroll: true })
    router.refresh()
  }, [searchParams, router, toast])

  return null
}
