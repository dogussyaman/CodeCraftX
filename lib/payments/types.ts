import type { CompanyPlan } from "@/lib/types"

export type BillingPeriod = "monthly" | "annually"
export type PaymentStatus = "pending" | "success" | "failed"
export type SubscriptionStatus =
  | "pending_payment"
  | "active"
  | "past_due"
  | "cancelled"

export interface CreatePaymentIntentInput {
  companyId: string
  plan: CompanyPlan
  billingPeriod: BillingPeriod
  amount: number
  currency: "TRY" | "USD"
  customerEmail: string
  metadata?: Record<string, unknown>
}

export interface CreatePaymentIntentResult {
  paymentId: string
  clientSecret?: string
  status: PaymentStatus
}

export interface ConfirmPaymentInput {
  paymentId: string
  providerPayload?: unknown
}

export interface ConfirmPaymentResult {
  status: "success" | "failed"
  paidAt?: string
}

export interface PaymentProvider {
  name: "mock" | "stripe" | "iyzico" | string
  createPaymentIntent(
    input: CreatePaymentIntentInput
  ): Promise<CreatePaymentIntentResult>
  confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult>
}

/** DB row shape for company_payments (for service/API use) */
export interface CompanyPaymentRow {
  id: string
  company_id: string
  plan: string
  billing_period: string
  amount: number
  currency: string
  status: PaymentStatus
  provider: string
  created_at: string
  paid_at: string | null
  metadata: Record<string, unknown>
}
