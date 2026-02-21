import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getPaymentProvider, PaymentService } from "@/lib/payments"
import type { CompanyPlan, BillingPeriod } from "@/lib/types"

const VALID_PLANS: CompanyPlan[] = ["free", "orta", "premium"]
const VALID_BILLING: BillingPeriod[] = ["monthly", "annually"]

const USE_IYZICO = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER === "iyzico"
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

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
      .select("company_id, role, must_change_password")
      .eq("id", user.id)
      .single()

    const body = await request.json().catch(() => ({}))
    const companyId = body?.companyId ?? profile?.company_id

    if (!companyId) {
      return NextResponse.json(
        { error: "Şirket bilgisi bulunamadı veya yetkiniz yok" },
        { status: 403 }
      )
    }

    const allowedRoles = ["company_admin", "hr"]
    if (!profile?.role || !allowedRoles.includes(profile.role)) {
      return NextResponse.json(
        { error: "Sadece şirket yöneticisi veya İK bu işlemi yapabilir" },
        { status: 403 }
      )
    }

    if (profile.role === "hr" && profile.company_id !== companyId) {
      return NextResponse.json(
        { error: "Sadece kendi şirketiniz için ödeme başlatabilirsiniz" },
        { status: 403 }
      )
    }

    const { data: company } = await supabase
      .from("companies")
      .select("plan, billing_period")
      .eq("id", companyId)
      .single()

    const plan: CompanyPlan = VALID_PLANS.includes(body?.plan)
      ? body.plan
      : (company?.plan as CompanyPlan) || "free"
    const billingPeriod: BillingPeriod = VALID_BILLING.includes(body?.billingPeriod)
      ? body.billingPeriod
      : (company?.billing_period as BillingPeriod) || "monthly"

    if (USE_IYZICO && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const edgeRes = await fetch(`${SUPABASE_URL}/functions/v1/create-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          companyId,
          plan,
          billingPeriod,
          userId: user.id,
        }),
      })
      const edgeData = await edgeRes.json().catch(() => ({}))
      if (!edgeRes.ok) {
        return NextResponse.json(
          { error: edgeData.error ?? "Ödeme başlatılamadı" },
          { status: edgeRes.status >= 500 ? 500 : 400 }
        )
      }
      if (edgeData.checkoutFormContent) {
        return NextResponse.json({
          success: true,
          checkoutFormContent: edgeData.checkoutFormContent,
          paymentId: edgeData.paymentId,
          mustChangePassword: profile?.must_change_password ?? false,
        })
      }
      return NextResponse.json(
        { error: edgeData.error ?? "Ödeme formu alınamadı" },
        { status: 400 }
      )
    }

    const provider = getPaymentProvider()
    const service = new PaymentService(provider)
    const result = await service.startPayment({
      companyId,
      plan,
      billingPeriod,
    })

    if (result.status === "failed") {
      return NextResponse.json(
        { error: "Ödeme işlemi başarısız" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      subscriptionStatus: result.subscriptionStatus ?? "active",
      lastPaymentAt: result.lastPaymentAt ?? null,
      subscriptionEndsAt: result.subscriptionEndsAt ?? null,
      mustChangePassword: profile?.must_change_password ?? false,
    })
  } catch (error: unknown) {
    console.error("start-mock-payment error:", error)
    const message =
      error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
