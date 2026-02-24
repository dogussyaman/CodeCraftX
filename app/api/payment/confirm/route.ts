import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getStripe } from "@/lib/stripe"

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

    const body = await request.json().catch(() => ({}))
    const paymentIntentId = typeof body?.paymentIntentId === "string" ? body.paymentIntentId.trim() : null
    const paymentId = typeof body?.paymentId === "string" ? body.paymentId.trim() : null

    if (!paymentIntentId || !paymentId) {
      return NextResponse.json({ error: "paymentIntentId ve paymentId gerekli" }, { status: 400 })
    }

    const stripe = getStripe()
    let paymentIntent
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    } catch {
      return NextResponse.json({ error: "Stripe ödeme bilgisi alınamadı" }, { status: 400 })
    }

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: `Ödeme henüz tamamlanmamış (durum: ${paymentIntent.status})` },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: companyPayment, error: payErr } = await admin
      .from("company_payments")
      .select("id, company_id, plan, billing_period, amount, status")
      .eq("id", paymentId)
      .eq("company_id", profile.company_id)
      .single()

    if (payErr || !companyPayment) {
      return NextResponse.json({ error: "Ödeme kaydı bulunamadı" }, { status: 404 })
    }

    if (companyPayment.status === "success") {
      return NextResponse.json({ success: true })
    }

    const now = new Date().toISOString()

    await admin
      .from("payments")
      .update({ status: "succeeded", updated_at: now })
      .eq("stripe_payment_intent_id", paymentIntentId)

    await admin
      .from("company_payments")
      .update({ status: "success", paid_at: now })
      .eq("id", paymentId)

    const { data: existingCompany } = await admin
      .from("companies")
      .select("subscription_started_at")
      .eq("id", companyPayment.company_id)
      .single()

    const subscriptionStartedAt = existingCompany?.subscription_started_at ?? now

    const endsAt = new Date(now)
    if (companyPayment.billing_period === "annually") {
      endsAt.setFullYear(endsAt.getFullYear() + 1)
    } else {
      endsAt.setMonth(endsAt.getMonth() + 1)
    }

    const { error: companyErr } = await admin
      .from("companies")
      .update({
        plan: companyPayment.plan,
        subscription_status: "active",
        billing_period: companyPayment.billing_period,
        current_plan_price: companyPayment.amount,
        last_payment_at: now,
        subscription_started_at: subscriptionStartedAt,
        subscription_ends_at: endsAt.toISOString(),
      })
      .eq("id", companyPayment.company_id)

    if (companyErr) {
      console.error("[payment/confirm] companies update error:", companyErr)
      return NextResponse.json({ error: "Abonelik güncellenemedi" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[payment/confirm] error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Beklenmeyen hata" },
      { status: 500 }
    )
  }
}
