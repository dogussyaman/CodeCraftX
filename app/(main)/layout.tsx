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
      {/* Global Background Effects – accent renkleri kullanır; dark’ta navbar altı glow kısa */}
      <div className="pointer-events-none fixed left-1/4 top-0 h-48 w-72 rounded-full bg-accent-400/15 blur-[80px] dark:bg-accent-500/12 dark:blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent-300/20 blur-[120px] dark:bg-accent-400/15" />

      <ModernNavbar />
      <div className="flex flex-col min-h-screen pt-16 relative z-10">
        <main className="flex-1">{children}</main>
        <ModernFooter />
      </div>
      <AdminThemeColorBar />
    </div>
  )
}
