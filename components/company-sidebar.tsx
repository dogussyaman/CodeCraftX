"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Briefcase,
  Star,
  Users,
  Bell,
  Ticket,
  MessageCircle,
  Settings,
  CreditCard,
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
  { title: "Panel", href: "/dashboard/company", icon: Home },
  { title: "Şirket Bilgileri", href: "/dashboard/company/ayarlar", icon: Settings },
  { title: "Üyelik", href: "/dashboard/company/uyelik", icon: CreditCard },
  { title: "Çalışanlar", href: "/dashboard/company/calisanlar", icon: Users },
  { title: "İş İlanları", href: "/dashboard/company/ilanlar", icon: Briefcase },
  { title: "Eşleşmeler", href: "/dashboard/company/eslesmeler", icon: Star },
  { title: "Bildirimler", href: "/dashboard/company/bildirimler", icon: Bell },
  { title: "Destek Taleplerim", href: "/dashboard/company/destek", icon: Ticket },
  { title: "Canlı Sohbet", href: "/dashboard/company/destek-sohbet", icon: MessageCircle },
]

interface CompanySidebarProps {
  profile?: { full_name?: string; email?: string } | null
  company?: { id: string; name: string | null; logo_url: string | null } | null
}

export function CompanySidebar({ profile, company }: CompanySidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard/company" className="flex items-center gap-3">
                {company?.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt=""
                    className="size-9 shrink-0 rounded-lg object-contain border border-sidebar-border bg-sidebar-accent"
                  />
                ) : null}
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-semibold text-base">
                    {company?.name || "CodeCraftX"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">Şirket</span>
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
            const isRoot = item.href === "/dashboard/company"
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
                <span className="truncate font-medium">{profile.full_name ?? "Şirket"}</span>
                <span className="truncate text-xs text-muted-foreground">{profile.email}</span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
