import type {
  PaymentProvider,
  CreatePaymentIntentInput,
  CreatePaymentIntentResult,
  ConfirmPaymentInput,
  ConfirmPaymentResult,
} from "./types"

/**
 * Stripe provider: returns pending so PaymentIntent is created by /api/payment/create.
 * Actual charge happens when user confirms on checkout page.
 */
export class StripePaymentProvider implements PaymentProvider {
  name = "stripe" as const

  async createPaymentIntent(
    input: CreatePaymentIntentInput
  ): Promise<CreatePaymentIntentResult> {
    return {
      paymentId: (input.metadata?.paymentId as string) ?? "",
      status: "pending",
    }
  }

  async confirmPayment(
    _input: ConfirmPaymentInput
  ): Promise<ConfirmPaymentResult> {
    return { status: "failed" }
  }
}
