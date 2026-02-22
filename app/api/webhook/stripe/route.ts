import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import Stripe from "stripe"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("[webhook/stripe] STRIPE_WEBHOOK_SECRET not set")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  let body: string
  try {
    body = await request.text()
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("[webhook/stripe] Signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type !== "payment_intent.succeeded") {
    return NextResponse.json({ received: true })
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent
  const companyPaymentId = paymentIntent.metadata?.company_payment_id

  if (!companyPaymentId) {
    console.error("[webhook/stripe] payment_intent missing company_payment_id metadata")
    return NextResponse.json({ error: "Invalid metadata" }, { status: 400 })
  }

  const admin = createAdminClient()
  const now = new Date().toISOString()

  const { data: existingPayment, error: paySelErr } = await admin
    .from("company_payments")
    .select("id, status, company_id, plan, billing_period, amount")
    .eq("id", companyPaymentId)
    .single()

  if (paySelErr || !existingPayment) {
    console.error("[webhook/stripe] company_payment not found:", companyPaymentId)
    return NextResponse.json({ error: "Payment not found" }, { status: 404 })
  }

  if (existingPayment.status === "success") {
    return NextResponse.json({ received: true })
  }

  await admin
    .from("payments")
    .update({ status: "succeeded", updated_at: now })
    .eq("stripe_payment_intent_id", paymentIntent.id)

  await admin
    .from("company_payments")
    .update({ status: "success", paid_at: now })
    .eq("id", companyPaymentId)

  const { data: company } = await admin
    .from("companies")
    .select("subscription_started_at")
    .eq("id", existingPayment.company_id)
    .single()

  const subscriptionStartedAt = company?.subscription_started_at ?? now
  const baseDate = new Date(now)
  const endsAt = new Date(baseDate)
  if (existingPayment.billing_period === "annually") {
    endsAt.setFullYear(endsAt.getFullYear() + 1)
  } else {
    endsAt.setMonth(endsAt.getMonth() + 1)
  }
  const subscriptionEndsAt = endsAt.toISOString()

  const { error: companyErr } = await admin
    .from("companies")
    .update({
      plan: existingPayment.plan,
      subscription_status: "active",
      billing_period: existingPayment.billing_period,
      current_plan_price: existingPayment.amount,
      last_payment_at: now,
      subscription_started_at: subscriptionStartedAt,
      subscription_ends_at: subscriptionEndsAt,
    })
    .eq("id", existingPayment.company_id)

  if (companyErr) {
    console.error("[webhook/stripe] companies update error:", companyErr)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
