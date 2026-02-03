"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/logo"
import { NotificationDropdown } from "@/components/notifications/notification-dropdown"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Profile } from "@/lib/types"

interface DashboardHeaderProps {
  profile: Profile
}

export function DashboardHeader({ profile }: DashboardHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const getInitials = (name: string) => {
    if (!name) return "??"
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "developer":
        return "Geliştirici"
      case "hr":
        return "İK Uzmanı"
      case "admin":
        return "Yönetici"
      default:
        return role
    }
  }

  const getDashboardPath = () => {
    if (profile.role === "admin") return "/dashboard/admin"
    if (profile.role === "hr") return "/dashboard/ik"
    return "/dashboard/gelistirici"
  }

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-40 transition-colors">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo href="/" />

        <div className="flex items-center gap-4">
          <ThemeToggle showLabel={false} />
          <div className="h-6 w-px bg-border/50" />
          <NotificationDropdown userId={profile.id} dashboardPath={getDashboardPath()} />
          <div className="h-6 w-px bg-border/50" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 h-10 px-2 hover:bg-muted/50 hover:text-foreground transition-colors rounded-full"
              >
                <div className="relative">
                  <Avatar className="size-8 border-2 border-border group-hover:border-primary/50 transition-colors">
                    <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? ""} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {getInitials(profile.full_name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-success border-2 border-background rounded-full" />
                </div>
                <div className="hidden md:block text-left py-0.5">
                  <div className="text-sm font-semibold leading-tight">{profile.full_name}</div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{getRoleLabel(profile.role)}</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{getRoleLabel(profile.role)}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/gelistirici/profil" className="cursor-pointer flex items-center py-2 px-3 hover:bg-muted/50 transition-colors">
                  <User className="mr-2 size-4 text-muted-foreground hover:text-foreground" />
                  <span >Profil Ayarları</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive flex items-center py-2 px-3 transition-colors"
              >
                <LogOut className="mr-2 size-4" />
                <span>Çıkış Yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
