"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

/**
 * Stripe redirect (3DS / return_url) sonrası URL parametrelerini yakalar.
 * - payment_intent + paymentId: /api/payment/confirm çağırıp DB'yi günceller.
 * - payment_success=1 (eski/basit akış): sadece toast gösterir.
 */
export function PaymentCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return

    const paymentSuccess = searchParams.get("payment_success")
    const paymentIntentId = searchParams.get("payment_intent")
    const redirectStatus = searchParams.get("redirect_status")
    const paymentId = searchParams.get("paymentId")

    if (paymentSuccess !== "1" && redirectStatus !== "succeeded") return
    handled.current = true

    if (paymentIntentId && paymentId) {
      fetch("/api/payment/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId, paymentId }),
      })
        .then(async (res) => {
          if (res.ok) {
            toast({
              title: "Ödeme alındı",
              description: "Ödemeniz onaylandı, aboneliğiniz aktif edildi.",
            })
          } else {
            const json = await res.json().catch(() => ({}))
            toast({
              title: "Ödeme doğrulanamadı",
              description: json?.error ?? "Lütfen üyelik sayfanızı kontrol edin.",
              variant: "destructive",
            })
          }
        })
        .catch(() => {
          toast({
            title: "Hata",
            description: "Ödeme doğrulanırken bir sorun oluştu.",
            variant: "destructive",
          })
        })
        .finally(() => {
          router.refresh()
          router.replace("/dashboard/company/uyelik", { scroll: true })
        })
      return
    }

    toast({
      title: "Ödeme alındı",
      description: "Ödemeniz onaylandı, aboneliğiniz aktif edildi.",
    })
    router.refresh()
    router.replace("/dashboard/company/uyelik", { scroll: true })
  }, [searchParams, router, toast])

  return null
}
