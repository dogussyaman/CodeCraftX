"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Home, LogOut, Sparkles, Shield } from "lucide-react"
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
  company?: { id: string; name: string | null; logo_url: string | null } | null
  plan?: string
}

export function DashboardShellHeader({ profile, company, plan }: DashboardShellHeaderProps) {
  const router = useRouter()
  const dashboardPath = getDashboardPath(profile.role)
  const isPremium = plan === "premium"
  const isAdmin =
    (profile.role === "admin" || profile.role === "platform_admin" || profile.role === "mt") &&
    !company

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const headerContent = (
    <>
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className={`mx-2 h-4 ${
          isPremium ? "bg-amber-500/40" : isAdmin ? "bg-indigo-500/40" : ""
        }`}
      />
      {isAdmin && (
        <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-400/20 dark:border-indigo-400/30 dark:text-indigo-300">
          <Shield className="size-3.5" />
          Yönetici
        </span>
      )}
      {company && (company.logo_url || company.name) ? (
        <Link
          href="/dashboard/company"
          className="flex items-center gap-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt=""
              className="size-7 rounded object-contain"
            />
          ) : null}
          <span className="hidden sm:inline truncate max-w-[140px]">
            {company.name || "Şirket"}
          </span>
        </Link>
      ) : null}
      {isPremium && (
        <span className="hidden sm:flex items-center gap-1.5 rounded-full from-amber-500/15 to-amber-600/10 border border-amber-500/30 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <Sparkles className="size-3.5" />
          Premium
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        asChild
        className={
          isPremium
            ? "gap-1.5 rounded-md border border-border bg-transparent dark:bg-transparent hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-700 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
            : isAdmin
              ? "gap-1.5 rounded-md border border-border bg-transparent dark:bg-transparent hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
              : "gap-1.5 rounded-md border border-border bg-transparent dark:bg-transparent hover:border-primary/40 hover:bg-muted dark:hover:bg-white/10 hover:text-foreground"
        }
      >
        <Link href="/" className="flex items-center gap-2 px-2 py-1.5 text-sm font-medium transition-colors">
          <Home className="size-4" />
          <span className="hidden sm:inline">Ana Sayfa</span>
        </Link>
      </Button>
      <div className="flex flex-1 items-center justify-end gap-2">
        <NotificationDropdown userId={profile.id} dashboardPath={dashboardPath} userRole={profile.role} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="rounded-md border border-border bg-transparent dark:bg-transparent hover:border-red-500/50 hover:bg-red-500/10 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Çıkış</span>
        </Button>
        <ThemeToggle showLabel={false} size="sm" />
      </div>
    </>
  )

  if (isPremium) {
    return (
      <header className="relative flex h-12 shrink-0 items-center gap-2 border-b border-amber-500/20 from-amber-500/5 via-transparent to-amber-600/5 px-4 lg:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(245,158,11,0.12),transparent)] pointer-events-none" />
        <div className="relative flex flex-1 items-center gap-2 min-w-0">
          {headerContent}
        </div>
      </header>
    )
  }

  if (isAdmin) {
    return (
      <header className="relative flex h-12 shrink-0 items-center gap-2 border-b border-indigo-500/20 px-4 lg:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent)] pointer-events-none dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]" />
        <div className="relative flex flex-1 items-center gap-2 min-w-0">
          {headerContent}
        </div>
      </header>
    )
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 lg:px-6">
      {headerContent}
    </header>
  )
}
