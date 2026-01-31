"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

function getRoleHome(role: string): string {
  if (role === "admin" || role === "platform_admin" || role === "mt") return "/dashboard/admin"
  if (role === "hr") return "/dashboard/ik"
  if (role === "company_admin") return "/dashboard/company"
  return "/dashboard/gelistirici"
}

function canAccessSegment(pathname: string, role: string): boolean {
  if (pathname.startsWith("/dashboard/admin"))
    return role === "admin" || role === "platform_admin" || role === "mt"
  if (pathname.startsWith("/dashboard/ik")) return role === "hr"
  if (pathname.startsWith("/dashboard/company")) return role === "company_admin"
  if (pathname.startsWith("/dashboard/gelistirici")) return role === "developer"
  return true
}

interface DashboardSegmentGuardProps {
  role: string
  children: ReactNode
}

export function DashboardSegmentGuard({ role, children }: DashboardSegmentGuardProps) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!pathname) return
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      router.replace(getRoleHome(role))
      return
    }
    if (!canAccessSegment(pathname, role)) {
      router.replace(getRoleHome(role))
    }
  }, [pathname, role, router])

  return <>{children}</>
}
