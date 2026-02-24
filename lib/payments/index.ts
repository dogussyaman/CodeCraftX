import { StripePaymentProvider } from "./stripe-provider"
import type { PaymentProvider } from "./types"

let defaultProvider: PaymentProvider | null = null

export function getPaymentProvider(): PaymentProvider {
  if (!defaultProvider) {
    defaultProvider = new StripePaymentProvider()
  }
  return defaultProvider
}

export { PaymentService } from "./service"
export { StripePaymentProvider } from "./stripe-provider"
export type {
  PaymentProvider,
  BillingPeriod,
  PaymentStatus,
  SubscriptionStatus,
  CreatePaymentIntentInput,
  CreatePaymentIntentResult,
  ConfirmPaymentInput,
  ConfirmPaymentResult,
  CompanyPaymentRow,
} from "./types"
export type { StartPaymentInput, StartPaymentResult, FinalizePaymentInput } from "./service"
