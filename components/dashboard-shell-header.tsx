"use client"

import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationDropdown } from "@/components/notifications/notification-dropdown"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Profile } from "@/lib/types"

function getDashboardPath(role: string): string {
  if (role === "admin" || role === "platform_admin" || role === "mt") return "/dashboard/admin"
  if (role === "hr") return "/dashboard/ik"
  if (role === "company_admin") return "/dashboard/company"
  return "/dashboard/gelistirici"
}

interface DashboardShellHeaderProps {
  profile: Profile
}

export function DashboardShellHeader({ profile }: DashboardShellHeaderProps) {
  const router = useRouter()
  const dashboardPath = getDashboardPath(profile.role)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-2 h-4" />
      <div className="flex flex-1 items-center justify-end gap-2">
        <NotificationDropdown userId={profile.id} dashboardPath={dashboardPath} />
        <Button type="button" variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Çıkış</span>
        </Button>
        <ThemeToggle showLabel={false} size="sm" />
      </div>
    </header>
  )
}
