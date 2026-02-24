import { createAdminClient } from "@/lib/supabase/admin"
import { getPlanPrice } from "@/lib/billing/plans"
import type { CompanyPlan } from "@/lib/types"
import type {
  PaymentProvider,
  BillingPeriod,
  CompanyPaymentRow,
} from "./types"

const DEFAULT_CURRENCY = "TRY" as const

export interface StartPaymentInput {
  companyId: string
  plan: CompanyPlan
  billingPeriod: BillingPeriod
  currency?: "TRY" | "USD"
}

export interface StartPaymentResult {
  paymentId: string
  status: "pending" | "success" | "failed"
  subscriptionStatus?: string
  lastPaymentAt?: string
  subscriptionEndsAt?: string
}

/** Finalize a successful payment: update company_payments row and companies row. */
export interface FinalizePaymentInput {
  paymentId: string
}

export class PaymentService {
  constructor(private provider: PaymentProvider) {}

  async startPayment(input: StartPaymentInput): Promise<StartPaymentResult> {
    const admin = createAdminClient()
    const currency = input.currency ?? DEFAULT_CURRENCY
    const allowMultiple =
      process.env.ALLOW_MULTIPLE_TEST_PAYMENTS === "true"

    const { data: company } = await admin
      .from("companies")
      .select("id, plan, contact_email, subscription_status")
      .eq("id", input.companyId)
      .single()

    if (!company) {
      throw new Error("Şirket bulunamadı")
    }
    const plan = (input.plan || (company.plan as CompanyPlan) || "free") as CompanyPlan
    const isPlanChange = plan !== (company.plan as CompanyPlan)

    // Üretimde aynı plan için tekrar ödeme açmayı engelle,
    // lokal/test ortamında ALLOW_MULTIPLE_TEST_PAYMENTS=true ise her zaman yeni ödeme kaydı oluştur.
    if (!allowMultiple && company.subscription_status === "active" && !isPlanChange) {
      return {
        paymentId: "",
        status: "success",
        subscriptionStatus: "active",
      }
    }

    const billingPeriod = (input.billingPeriod || "monthly") as BillingPeriod
    const finalAmount = getPlanPrice(plan, billingPeriod)

    const { data: paymentRow, error: insertError } = await admin
      .from("company_payments")
      .insert({
        company_id: input.companyId,
        plan,
        billing_period: billingPeriod,
        amount: finalAmount,
        currency,
        status: "pending",
        provider: this.provider.name,
        metadata: {},
      })
      .select("id")
      .single()

    if (insertError || !paymentRow) {
      throw new Error(insertError?.message ?? "Ödeme kaydı oluşturulamadı")
    }

    const intent = await this.provider.createPaymentIntent({
      companyId: input.companyId,
      plan,
      billingPeriod,
      amount: finalAmount,
      currency,
      customerEmail: company.contact_email ?? "",
      metadata: { paymentId: paymentRow.id },
    })

    if (intent.status === "failed") {
      await admin
        .from("company_payments")
        .update({ status: "failed" })
        .eq("id", paymentRow.id)
      return { paymentId: paymentRow.id, status: "failed" }
    }

    if (intent.status === "success") {
      const result = await this.finalizePayment({
        paymentId: paymentRow.id,
      })
      return {
        paymentId: paymentRow.id,
        status: "success",
        subscriptionStatus: result.subscriptionStatus,
        lastPaymentAt: result.lastPaymentAt,
        subscriptionEndsAt: result.subscriptionEndsAt,
      }
    }

    return {
      paymentId: paymentRow.id,
      status: "pending",
    }
  }

  async finalizePayment(input: FinalizePaymentInput): Promise<{
    subscriptionStatus: string
    lastPaymentAt?: string
    subscriptionEndsAt?: string
  }> {
    const admin = createAdminClient()
    const now = new Date().toISOString()

    const { data: payment, error: payErr } = await admin
      .from("company_payments")
      .update({
        status: "success",
        paid_at: now,
      })
      .eq("id", input.paymentId)
      .select("company_id, amount, plan, billing_period")
      .single()

    if (payErr || !payment) {
      throw new Error(payErr?.message ?? "Ödeme güncellenemedi")
    }

    const { data: existingCompany } = await admin
      .from("companies")
      .select("subscription_started_at")
      .eq("id", payment.company_id)
      .single()

    const subscriptionStartedAt = existingCompany?.subscription_started_at ?? now

    // Faturalandırma dönemine göre bitiş tarihini hesapla
    const baseDate = new Date(now)
    const endsAt = new Date(baseDate)
    if (payment.billing_period === "annually") {
      endsAt.setFullYear(endsAt.getFullYear() + 1)
    } else {
      // varsayılan: aylık
      endsAt.setMonth(endsAt.getMonth() + 1)
    }
    const subscriptionEndsAt = endsAt.toISOString()

    const { error: companyErr } = await admin
      .from("companies")
      .update({
        plan: payment.plan,
        subscription_status: "active",
        billing_period: payment.billing_period,
        current_plan_price: payment.amount,
        last_payment_at: now,
        subscription_started_at: subscriptionStartedAt,
        subscription_ends_at: subscriptionEndsAt,
      })
      .eq("id", payment.company_id)

    if (companyErr) {
      throw new Error(companyErr.message)
    }

    return {
      subscriptionStatus: "active",
      lastPaymentAt: now,
      subscriptionEndsAt,
    }
  }
}
