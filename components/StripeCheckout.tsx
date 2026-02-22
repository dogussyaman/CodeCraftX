"use client"

import { useState } from "react"
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"

interface StripeCheckoutProps {
  amount: number
  onSuccess: () => void
  onError: (message: string) => void
}

export function StripeCheckout({ amount, onSuccess, onError }: StripeCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/company/uyelik?payment_success=1`,
        },
      })

      if (error) {
        onError(error.message ?? "Ödeme tamamlanamadı")
        setLoading(false)
        return
      }
      onSuccess()
    } catch (err) {
      onError(err instanceof Error ? err.message : "Beklenmeyen hata")
    } finally {
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
      <Button type="submit" size="lg" disabled={!stripe || !elements || loading} className="w-full">
        {loading ? "İşleniyor…" : `${amount.toLocaleString("tr-TR")} ₺ Öde`}
      </Button>
    </form>
  )
}
