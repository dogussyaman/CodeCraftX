import type { CompanyPlan } from "@/lib/types"
import type { BillingPeriod } from "@/lib/payments/types"

/** Plan + billing period -> price in TRY. Single source for all pricing. */
const PRICE_MAP: Record<CompanyPlan, Record<BillingPeriod, number>> = {
  free: { monthly: 0, annually: 0 },
  orta: { monthly: 1299, annually: 12990 },
  premium: { monthly: 2999, annually: 29990 },
}

/** Display name for UI (Basic, Pro, Enterprise). Slug stays free | orta | premium in DB. */
export function getPlanDisplayName(plan: CompanyPlan): string {
  const names: Record<CompanyPlan, string> = {
    free: "Basic",
    orta: "Pro",
    premium: "Enterprise",
  }
  return names[plan] ?? plan
}

export function getPlanPrice(plan: CompanyPlan, period: BillingPeriod): number {
  return PRICE_MAP[plan]?.[period] ?? 0
}
