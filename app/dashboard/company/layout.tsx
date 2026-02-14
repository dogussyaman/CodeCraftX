import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CompanyPaymentGate } from "@/components/company/CompanyPaymentGate"
import type { CompanyPlan, SubscriptionStatus, BillingPeriod } from "@/lib/types"

export default async function CompanyLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/giris")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, company_id, must_change_password")
    .eq("id", user.id)
    .single()

  if (!profile || !profile.company_id) {
    redirect("/dashboard")
  }

  const allowedRoles = ["company_admin", "hr"]
  if (!profile.role || !allowedRoles.includes(profile.role)) {
    redirect("/dashboard")
  }

  // Güvenlik için: hala must_change_password true ise kullanıcıyı ilk giriş akışına yönlendir
  if (profile.must_change_password) {
    redirect("/auth/sifre-degistir?first_login=true")
  }

  const { data: company } = await supabase
    .from("companies")
    .select(
      "id, subscription_status, plan, billing_period, current_plan_price, last_payment_at, subscription_ends_at",
    )
    .eq("id", profile.company_id)
    .single()

  if (!company) {
    redirect("/dashboard")
  }

  const subscriptionStatus = (company.subscription_status ?? "pending_payment") as SubscriptionStatus
  const plan = (company.plan ?? "free") as CompanyPlan
  const billingPeriod = (company.billing_period ?? "monthly") as BillingPeriod

  return (
    <CompanyPaymentGate
      companyId={company.id}
      subscriptionStatus={subscriptionStatus}
      plan={plan}
      billingPeriod={billingPeriod}
      lastPaymentAt={company.last_payment_at}
      subscriptionEndsAt={company.subscription_ends_at}
      currentPlanPrice={company.current_plan_price}
    >
      {children}
    </CompanyPaymentGate>
  )
}

