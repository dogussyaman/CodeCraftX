import { createClient } from "@/lib/supabase/server"
import { DashboardNotificationsPage } from "@/components/notifications/dashboard-notifications-page"
import { CompanyBroadcastForm } from "./_components/CompanyBroadcastForm"
import { Bell } from "lucide-react"

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
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Bell className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bildirimler</h1>
            <p className="text-sm text-muted-foreground">
              Şirket hesabınıza gelen bildirimler ve şirket içi bildirim gönderimi.
            </p>
          </div>
        </div>
      </div>

      {companyId && (
        <CompanyBroadcastForm companyId={companyId} />
      )}

      <DashboardNotificationsPage
        userId={user?.id}
        subtitle="Şirketinize gelen tüm bildirimleri burada görebilirsiniz."
        hideHeader
      />
    </div>
  )
}
