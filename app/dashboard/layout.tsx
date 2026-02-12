import type { ReactNode } from "react"
import { Suspense } from "react"
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
import { DashboardProjeYetkinizToast } from "@/components/dashboard-proje-yetkiniz-toast"
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

  // Emniyet amaçlı: must_change_password flag'i hala açıksa kullanıcıyı ilk giriş şifre değiştirme ekranına yönlendir
  if ((profile as any).must_change_password) {
    redirect("/auth/sifre-degistir?first_login=true")
  }

  const role = getRole(profile as Profile)

  let company: { id: string; name: string | null; logo_url: string | null; plan?: string | null } | null = null
  const profileWithCompany = profile as Profile & { company_id?: string }
  if ((role === "company_admin" || role === "hr") && profileWithCompany.company_id) {
    const { data: companyRow } = await supabase
      .from("companies")
      .select("id, name, logo_url, plan")
      .eq("id", profileWithCompany.company_id)
      .single()
    company = companyRow ?? null
  }

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

  const segment =
    role === "admin" || role === "platform_admin" || role === "mt"
      ? "admin"
      : role === "hr"
        ? "hr"
        : role === "company_admin"
          ? company?.plan === "premium"
            ? "company-premium"
            : company?.plan === "orta"
              ? "company-orta"
              : "company-free"
          : "developer"

  return (
    <SidebarProvider defaultOpen={defaultOpen} data-segment={segment}>
      {role === "company_admin" ? (
        <CompanySidebar profile={profile as Profile} company={company} />
      ) : (
        <SidebarComponent profile={profile as Profile} />
      )}
      <SidebarInset className="flex min-h-screen flex-col">
        <DashboardShellHeader
          profile={profile as Profile}
          company={company}
          plan={company?.plan ?? undefined}
        />
        <main className="min-h-screen flex-1 flex flex-col p-4 md:p-6">
          <Suspense fallback={null}>
            <DashboardProjeYetkinizToast />
          </Suspense>
          <DashboardSegmentGuard role={role}>
            <div className="flex-1 flex flex-col min-h-0">{children}</div>
          </DashboardSegmentGuard>
        </main>
        <DashboardFooter role={role} company={company} plan={company?.plan ?? undefined} />
      </SidebarInset>
    </SidebarProvider>
  )
}
