import { createClient } from "@/lib/supabase/server"
import { DashboardNotificationsPage } from "@/components/notifications/dashboard-notifications-page"
import { CompanyBroadcastForm } from "./_components/CompanyBroadcastForm"

export default async function CompanyNotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let companyId: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single()
    companyId = profile?.company_id ?? null
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl min-h-screen space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Bildirimler</h1>
        <p className="text-muted-foreground mt-1">
          Şirket hesabınıza gelen bildirimler ve şirket içi bildirim gönderimi.
        </p>
      </div>

      {companyId && (
        <CompanyBroadcastForm companyId={companyId} />
      )}

      <DashboardNotificationsPage subtitle="Şirketinize gelen tüm bildirimleri burada görebilirsiniz." />
    </div>
  )
}
