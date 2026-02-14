import { MockPaymentProvider } from "./mock-provider"
import type { PaymentProvider } from "./types"

let defaultProvider: PaymentProvider | null = null

export function getPaymentProvider(): PaymentProvider {
  if (!defaultProvider) {
    defaultProvider = new MockPaymentProvider()
  }
  return defaultProvider
}

export { PaymentService } from "./service"
export { MockPaymentProvider } from "./mock-provider"
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
