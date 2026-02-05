"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  Briefcase,
  Users,
  Star,
  Home,
  Bell,
  Ticket,
  MessageCircle,
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
import { cn } from "@/lib/utils"

const menuItems = [
  { title: "Panel", href: "/dashboard/ik", icon: Home },
  { title: "Şirket Bilgileri", href: "/dashboard/ik/sirket", icon: Building2 },
  { title: "İş İlanları", href: "/dashboard/ik/ilanlar", icon: Briefcase },
  { title: "Eşleşmeler", href: "/dashboard/ik/eslesmeler", icon: Star },
  { title: "Başvurular", href: "/dashboard/ik/basvurular", icon: Users },
  { title: "Bildirimler", href: "/dashboard/ik/bildirimler", icon: Bell },
  { title: "Destek Taleplerim", href: "/dashboard/ik/destek", icon: Ticket },
  { title: "Canlı Sohbet", href: "/dashboard/ik/destek-sohbet", icon: MessageCircle },
]

interface HRSidebarProps {
  profile?: { full_name?: string; email?: string } | null
}

export function HRSidebar({ profile }: HRSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard/ik">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-base">CodeCraftX</span>
                  <span className="truncate text-xs text-muted-foreground">İK</span>
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
            const isRoot = item.href === "/dashboard/ik"
            const isActive =
              isRoot
                ? pathname === item.href
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
              <div className="flex flex-col gap-0.5 rounded-lg px-3 py-2 text-sm">
                <span className="truncate font-medium">{profile.full_name ?? "İK"}</span>
                <span className="truncate text-xs text-muted-foreground">{profile.email}</span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
