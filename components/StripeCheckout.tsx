"use client"

import { useState } from "react"
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Lock, CreditCard } from "lucide-react"

interface StripeCheckoutProps {
  amount: number
  paymentId: string
  onSuccess: () => void
  onError: (message: string) => void
}

export function StripeCheckout({ amount, paymentId, onSuccess, onError }: StripeCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        onError(submitError.message ?? "Form doğrulanamadı")
        setLoading(false)
        return
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/company/uyelik?payment_success=1&paymentId=${paymentId}`,
        },
      })

      if (error) {
        onError(error.message ?? "Ödeme tamamlanamadı")
        setLoading(false)
        return
      }

      if (paymentIntent?.status === "succeeded") {
        const res = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id, paymentId }),
        })
        if (!res.ok) {
          const json = await res.json().catch(() => ({}))
          onError(json?.error ?? "Abonelik güncellenemedi")
          setLoading(false)
          return
        }
        onSuccess()
      } else {
        onError("Ödeme durumu beklenmedik: " + (paymentIntent?.status ?? "bilinmiyor"))
        setLoading(false)
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Beklenmeyen hata")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5 shrink-0 text-emerald-500" />
        <span>Ödemeniz Stripe altyapısıyla 256-bit SSL ile şifreleniyor</span>
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={!stripe || !elements || loading}
        className="w-full gap-2"
      >
        {loading ? (
          <>
            <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            İşleniyor…
          </>
        ) : (
          <>
            <CreditCard className="size-4" />
            {amount.toLocaleString("tr-TR")} ₺ Öde
          </>
        )}
      </Button>
    </form>
  )
}
