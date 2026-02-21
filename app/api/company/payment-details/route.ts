import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getPlanDisplayName } from "@/lib/billing/plans"
import type { CompanyPlan } from "@/lib/types"

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")
    if (!paymentId) {
      return NextResponse.json({ error: "paymentId gerekli" }, { status: 400 })
    }

    const { data: payment, error: paymentError } = await supabase
      .from("company_payments")
      .select("id, company_id, plan, billing_period, amount, currency, status")
      .eq("id", paymentId)
      .eq("company_id", profile.company_id)
      .eq("status", "pending")
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Ödeme bulunamadı veya tamamlanmış" }, { status: 404 })
    }

    const plan = (payment.plan as CompanyPlan) ?? "free"
    const amount = typeof payment.amount === "number" ? payment.amount : Number(payment.amount) || 0

    return NextResponse.json({
      plan,
      billingPeriod: payment.billing_period ?? "monthly",
      amount,
      planDisplayName: getPlanDisplayName(plan),
      currency: payment.currency ?? "TRY",
    })
  } catch (err) {
    console.error("payment-details error:", err)
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu" },
      { status: 500 }
    )
  }
}
