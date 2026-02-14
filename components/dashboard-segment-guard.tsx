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
  if (pathname.startsWith("/dashboard/gelistirici")) return role === "developer" || role === "admin"
  return true
}

function isProjelerimPath(pathname: string): boolean {
  return pathname.includes("projelerim")
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
      const home = getRoleHome(role)
      const suffix = isProjelerimPath(pathname) ? "?proje_yetkiniz=1" : ""
      router.replace(home + suffix)
    }
  }, [pathname, role, router])

  return <>{children}</>
}
