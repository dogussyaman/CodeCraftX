"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function PaymentCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const handled = useRef(false)

  useEffect(() => {
    const payment = searchParams.get("payment")
    const token = searchParams.get("token")
    if (payment !== "callback" || !token || handled.current) return
    handled.current = true

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/company/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (data.success) {
          toast({
            title: "Ödeme alındı",
            description: "Ödemeniz onaylandı, aboneliğiniz aktif edildi.",
          })
          if (!cancelled) {
            router.replace("/dashboard/company/uyelik", { scroll: true })
            router.refresh()
          }
        } else {
          toast({
            title: "Ödeme doğrulanamadı",
            description: data.error ?? "Lütfen tekrar deneyin.",
            variant: "destructive",
          })
          if (!cancelled) {
            router.replace("/dashboard/company/uyelik", { scroll: true })
            router.refresh()
          }
        }
      } catch {
        if (!cancelled) {
          toast({
            title: "Hata",
            description: "Ödeme doğrulanırken bir hata oluştu.",
            variant: "destructive",
          })
          router.replace("/dashboard/company/uyelik", { scroll: true })
          router.refresh()
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [searchParams, router, toast])

  return null
}
