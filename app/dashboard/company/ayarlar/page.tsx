import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CompanySettingsForm } from "@/components/company/CompanySettingsForm"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import Link from "next/link"

export default async function CompanyAyarlarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/giris")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single()

  if (!profile?.company_id) {
    redirect("/dashboard/company")
  }

  const allowedRoles = ["company_admin", "hr"]
  if (!profile.role || !allowedRoles.includes(profile.role)) {
    redirect("/dashboard/company")
  }

  const { data: company, error } = await supabase
    .from("companies")
    .select("id, name, description, industry, website, location, employee_count, logo_url, plan, subscription_status, billing_period, current_plan_price, last_payment_at, subscription_ends_at, created_by, created_at, updated_at, contact_email, phone, address, legal_title, tax_number, tax_office")
    .eq("id", profile.company_id)
    .single()

  if (error || !company) {
    redirect("/dashboard/company")
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Settings className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Şirket Bilgileri</h1>
            <p className="text-sm text-muted-foreground">
              Genel bilgilerinizi görüntüleyin ve güncelleyin. Plan ve abonelik üyelik sayfasından yönetilir.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/company">Panele Dön</Link>
        </Button>
      </div>
      <CompanySettingsForm company={company} />
    </div>
  )
}
