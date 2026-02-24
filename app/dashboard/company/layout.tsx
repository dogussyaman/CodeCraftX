import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CompanyPaymentGate } from "@/components/company/CompanyPaymentGate"
import type { SubscriptionStatus } from "@/lib/types"

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

  if (profile.must_change_password) {
    redirect("/auth/sifre-degistir?first_login=true")
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id, subscription_status")
    .eq("id", profile.company_id)
    .single()

  if (!company) {
    redirect("/dashboard")
  }

  const subscriptionStatus = (company.subscription_status ?? "pending_payment") as SubscriptionStatus

  return (
    <CompanyPaymentGate subscriptionStatus={subscriptionStatus}>
      {children}
    </CompanyPaymentGate>
  )
}

