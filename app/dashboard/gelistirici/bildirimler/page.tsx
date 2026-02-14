import { createClient } from "@/lib/supabase/server"
import { DashboardNotificationsPage } from "@/components/notifications/dashboard-notifications-page"

export default async function DeveloperNotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <DashboardNotificationsPage userId={user?.id} userRole="developer" />
}
