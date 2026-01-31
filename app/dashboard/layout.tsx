import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DeveloperSidebar } from "@/components/developer-sidebar"
import { HRSidebar } from "@/components/hr-sidebar"
import { CompanySidebar } from "@/components/company-sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardShellHeader } from "@/components/dashboard-shell-header"
import { DashboardSegmentGuard } from "@/components/dashboard-segment-guard"
import { DashboardFooter } from "@/components/dashboard-footer"
import type { Profile } from "@/lib/types"

const DASHBOARD_ROLES = ["developer", "hr", "company_admin", "admin", "platform_admin", "mt"] as const

function getRole(profile: Profile | null): string {
  if (!profile?.role) return "developer"
  const r = profile.role as string
  if (DASHBOARD_ROLES.includes(r as (typeof DASHBOARD_ROLES)[number])) return r
  return "developer"
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/giris")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/giris")
  }

  const role = getRole(profile as Profile)

  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  const SidebarComponent =
    role === "admin" || role === "platform_admin" || role === "mt"
      ? AdminSidebar
      : role === "hr"
        ? HRSidebar
        : role === "company_admin"
          ? CompanySidebar
          : DeveloperSidebar

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SidebarComponent profile={profile as Profile} />
      <SidebarInset className="flex min-h-screen flex-col">
        <DashboardShellHeader profile={profile as Profile} />
        <main className="min-h-screen flex-1 flex flex-col p-4 md:p-6">
          <DashboardSegmentGuard role={role}>
            <div className="flex-1 flex flex-col min-h-0">{children}</div>
          </DashboardSegmentGuard>
        </main>
        <DashboardFooter role={role} />
      </SidebarInset>
    </SidebarProvider>
  )
}
