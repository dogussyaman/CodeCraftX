"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  Home,
  Briefcase,
  Star,
  User,
  Search,
  PenTool,
  Bell,
  Ticket,
  MessageCircle,
  Code2,
  BookOpen,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const menuItems = [
  { title: "Panel", href: "/dashboard/gelistirici", icon: Home },
  { title: "CV'lerim", href: "/dashboard/gelistirici/cv", icon: FileText },
  { title: "Ön Yazılarım", href: "/dashboard/gelistirici/on-yazilar", icon: PenTool },
  { title: "Eşleşmeler", href: "/dashboard/gelistirici/eslesmeler", icon: Star },
  { title: "Başvurularım", href: "/dashboard/gelistirici/basvurular", icon: Briefcase },
  { title: "Projelerim", href: "/dashboard/gelistirici/projelerim", icon: Code2 },
  { title: "Blog Yazılarım", href: "/dashboard/gelistirici/yazilarim", icon: BookOpen },
  { title: "Bildirimler", href: "/dashboard/gelistirici/bildirimler", icon: Bell },
  { title: "Destek Taleplerim", href: "/dashboard/gelistirici/destek", icon: Ticket },
  { title: "Canlı Sohbet", href: "/dashboard/gelistirici/destek-sohbet", icon: MessageCircle },
  { title: "İş İlanları", href: "/is-ilanlari", icon: Search },
  { title: "Profil", href: "/dashboard/gelistirici/profil", icon: User },
]

interface DeveloperSidebarProps {
  profile?: { full_name?: string; email?: string; avatar_url?: string | null } | null
}

export function DeveloperSidebar({ profile }: DeveloperSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard/gelistirici" className="flex items-center gap-3">
                {profile?.avatar_url != null || profile?.full_name ? (
                  <Avatar className="size-9 shrink-0 border border-sidebar-border">
                    <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? ""} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {(profile?.full_name ?? "Geliştirici")
                        .split(" ")
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                ) : null}
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-semibold text-base">CodeCrafters</span>
                  <span className="truncate text-xs text-muted-foreground">Geliştirici</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto">
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isRoot = item.href === "/dashboard/gelistirici"
            const isActive =
              isRoot
                ? pathname === item.href
                : item.href === "/is-ilanlari"
                  ? pathname === "/is-ilanlari"
                  : pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-2 text-sm font-medium transition-colors duration-150",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {profile && (
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm min-w-0">
                <Avatar className="size-9 shrink-0 border border-sidebar-border">
                  <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? ""} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {(profile.full_name ?? "Geliştirici")
                      .split(" ")
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="truncate font-medium">{profile.full_name ?? "Geliştirici"}</span>
                  <span className="truncate text-xs text-muted-foreground">{profile.email}</span>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
