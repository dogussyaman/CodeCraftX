import type {
  PaymentProvider,
  CreatePaymentIntentInput,
  CreatePaymentIntentResult,
  ConfirmPaymentInput,
  ConfirmPaymentResult,
} from "./types"

/** Mock provider: no external calls, immediately returns success. */
export class MockPaymentProvider implements PaymentProvider {
  name = "mock" as const

  async createPaymentIntent(
    _input: CreatePaymentIntentInput
  ): Promise<CreatePaymentIntentResult> {
    const paymentId = crypto.randomUUID()
    return {
      paymentId,
      status: "success",
    }
  }

  async confirmPayment(
    input: ConfirmPaymentInput
  ): Promise<ConfirmPaymentResult> {
    return {
      status: "success",
      paidAt: new Date().toISOString(),
    }
  }
}
