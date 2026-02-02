import type React from "react"
import { ModernNavbar } from "@/components/modern-navbar"
import { ModernFooter } from "@/components/modern-footer"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen">
      {/* Global Background Effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <ModernNavbar />
      <div className="flex flex-col min-h-screen pt-16 relative z-10">
        <main className="flex-1">{children}</main>
        <ModernFooter />
      </div>
    </div>
  )
}
