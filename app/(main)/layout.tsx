import type React from "react"
import { ModernNavbar } from "@/components/modern-navbar"
import { ModernFooter } from "@/components/modern-footer"
import { AdminThemeColorBar } from "@/components/admin-theme-color-bar"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      <ModernNavbar />
      <div className="flex flex-col min-h-screen pt-16 relative z-10">
        <main className="flex-1">{children}</main>
        <ModernFooter />
      </div>
      <AdminThemeColorBar />
    </div>
  )
}
