"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  Building2,
  Briefcase,
  Star,
  BarChart3,
  Settings,
  Bell,
  ClipboardList,
  Mail,
  FileText,
  Code2,
  TestTube2,
  Banknote,
  UsersRound,
  List,
  Calendar,
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

const baseMenuItems = [
  { title: "Panel", href: "/dashboard/admin", icon: Home },
  { title: "Kullanıcılar", href: "/dashboard/admin/kullanicilar", icon: Users },
  { title: "Şirketler", href: "/dashboard/admin/sirketler", icon: Building2 },
  { title: "Şirket Talepleri", href: "/dashboard/admin/sirket-talepleri", icon: ClipboardList },
  { title: "İş İlanları", href: "/dashboard/admin/ilanlar", icon: Briefcase },
  { title: "Eşleştirmeler", href: "/dashboard/admin/eslestirme", icon: Star },
  { title: "İstatistikler", href: "/dashboard/admin/istatistikler", icon: BarChart3 },
  { title: "Gelir / Gider", href: "/dashboard/admin/gelir-gider", icon: Banknote },
  { title: "Bildirimler", href: "/dashboard/admin/bildirimler", icon: Bell },
  { title: "Blog", href: "/dashboard/admin/blog", icon: FileText },
  { title: "Etkinlikler", href: "/dashboard/admin/etkinlikler", icon: Calendar },
  { title: "Topluluk Üyeleri", href: "/dashboard/admin/topluluk-uyeleri", icon: UsersRound },
  { title: "Topluluk Konuları", href: "/dashboard/admin/topluluk-konulari", icon: List },
  { title: "Bülten", href: "/dashboard/admin/bulten", icon: Mail },
  { title: "Yetenekler", href: "/dashboard/admin/yetenekler", icon: Settings },
  { title: "Email Test", href: "/dashboard/admin/email-test", icon: TestTube2 },
]

const projelerItem = { title: "Projeler", href: "/dashboard/admin/projeler", icon: Code2 }

interface AdminSidebarProps {
  profile?: { full_name?: string; email?: string; role?: string } | null
}

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname()
  const menuItems =
    profile?.role === "admin"
      ? [baseMenuItems[0], projelerItem, ...baseMenuItems.slice(1)]
      : baseMenuItems

  return (
    <Sidebar className="group-data-[side=left]:border-r group-data-[side=left]:border-indigo-500/20">
      <SidebarHeader className="border-b border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 to-transparent dark:from-indigo-500/15">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard/admin">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-base">CodeCraftX</span>
                  <span className="truncate text-xs text-muted-foreground">Yönetici</span>
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
            const isRoot = item.href === "/dashboard/admin"
            const isProjeler = item.href === "/dashboard/admin/projeler"
            const isActive = isRoot
              ? pathname === item.href
              : isProjeler
                ? pathname === item.href || pathname.startsWith(item.href + "/")
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
                        ? "border-indigo-500 bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
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
                <span className="truncate font-medium">{profile.full_name ?? "Yönetici"}</span>
                <span className="truncate text-xs text-muted-foreground dark:text-foreground/75">{profile.email}</span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
