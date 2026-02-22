import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getStripe } from "@/lib/stripe"
import { getPlanPrice } from "@/lib/billing/plans"
import type { CompanyPlan } from "@/lib/types"
import type { BillingPeriod } from "@/lib/payments/types"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .single()

    if (!profile?.company_id) {
      return NextResponse.json({ error: "Şirket bilgisi bulunamadı" }, { status: 403 })
    }

    const allowedRoles = ["company_admin", "hr"]
    if (!profile.role || !allowedRoles.includes(profile.role)) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const paymentId = typeof body?.paymentId === "string" ? body.paymentId.trim() : null
    const idempotencyKey = typeof body?.idempotencyKey === "string" ? body.idempotencyKey.trim() : null

    if (!paymentId || !idempotencyKey) {
      return NextResponse.json(
        { error: "paymentId ve idempotencyKey gerekli" },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: companyPayment, error: paymentError } = await admin
      .from("company_payments")
      .select("id, company_id, plan, billing_period, amount, currency, status")
      .eq("id", paymentId)
      .eq("company_id", profile.company_id)
      .eq("status", "pending")
      .single()

    if (paymentError || !companyPayment) {
      return NextResponse.json(
        { error: "Ödeme bulunamadı veya tamamlanmış" },
        { status: 404 }
      )
    }

    const amount = Number(companyPayment.amount) || 0
    const plan = (companyPayment.plan as CompanyPlan) ?? "free"
    const billingPeriod = (companyPayment.billing_period as BillingPeriod) ?? "monthly"
    const expectedAmount = getPlanPrice(plan, billingPeriod)

    if (amount <= 0 || amount !== expectedAmount) {
      return NextResponse.json(
        { error: "Geçersiz tutar" },
        { status: 400 }
      )
    }

    const amountInKurus = Math.round(amount * 100)

    try {
      const stripe = getStripe()

      const existingPayment = await admin
        .from("payments")
        .select("id, stripe_payment_intent_id")
        .eq("idempotency_key", idempotencyKey)
        .single()

      if (existingPayment.data?.stripe_payment_intent_id) {
        const pi = await stripe.paymentIntents.retrieve(existingPayment.data.stripe_payment_intent_id)
        if (pi.client_secret) {
          return NextResponse.json({ clientSecret: pi.client_secret })
        }
      }

      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: amountInKurus,
          currency: "try",
          automatic_payment_methods: { enabled: true },
          metadata: {
            company_payment_id: paymentId,
            company_id: companyPayment.company_id,
            user_id: user.id,
            plan,
            billing_period: billingPeriod,
          },
        },
        { idempotencyKey }
      )

      const { error: insertErr } = await admin.from("payments").insert({
        user_id: user.id,
        order_id: paymentId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: amountInKurus,
        currency: "try",
        status: "pending",
        idempotency_key: idempotencyKey,
        metadata: { plan, billing_period: billingPeriod },
      })

      if (insertErr) {
        if (insertErr.code === "23505") {
          const retry = await admin
            .from("payments")
            .select("stripe_payment_intent_id")
            .eq("idempotency_key", idempotencyKey)
            .single()
          if (retry.data?.stripe_payment_intent_id) {
            const pi = await stripe.paymentIntents.retrieve(retry.data.stripe_payment_intent_id)
            if (pi.client_secret) {
              return NextResponse.json({ clientSecret: pi.client_secret })
            }
          }
        }
        throw insertErr
      }

      await admin
        .from("company_payments")
        .update({
          stripe_payment_intent_id: paymentIntent.id,
          provider: "stripe",
        })
        .eq("id", paymentId)

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentId,
      })
    } catch (err) {
      console.error("[payment/create] Stripe error:", err)
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Ödeme başlatılamadı" },
        { status: 500 }
      )
    }
  } catch (err) {
    console.error("[payment/create] error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Beklenmeyen hata" },
      { status: 500 }
    )
  }
}
