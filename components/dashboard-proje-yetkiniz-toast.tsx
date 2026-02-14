"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

const MESSAGE = "Proje eklemeye yetkiniz yok. Sadece geliştirici ve admin proje ekleyebilir."

export function DashboardProjeYetkinizToast() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shownRef = useRef(false)

  useEffect(() => {
    const projeYetkiniz = searchParams.get("proje_yetkiniz")
    if (projeYetkiniz !== "1") return
    if (shownRef.current) return
    shownRef.current = true
    toast.error(MESSAGE)
    const next = new URLSearchParams(searchParams)
    next.delete("proje_yetkiniz")
    const q = next.toString()
    router.replace(pathname + (q ? `?${q}` : ""), { scroll: false })
  }, [pathname, router, searchParams])

  return null
}
