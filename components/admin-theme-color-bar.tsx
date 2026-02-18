"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useThemeAccent, type ThemeAccent } from "@/components/theme-accent-provider"
import { cn } from "@/lib/utils"

const ACCENT_OPTIONS: { value: ThemeAccent; label: string; bgClass: string }[] = [
  { value: "orange", label: "Turuncu", bgClass: "bg-[#f97316]" },
  { value: "blue", label: "Mavi", bgClass: "bg-[#3b82f6]" },
  { value: "purple", label: "Mor", bgClass: "bg-[#a855f7]" },
  { value: "green", label: "Yeşil", bgClass: "bg-[#22c55e]" },
  { value: "red", label: "Kırmızı", bgClass: "bg-[#ef4444]" },
]

const ADMIN_ROLES = ["admin", "platform_admin", "mt"] as const

export function AdminThemeColorBar() {
  const pathname = usePathname()
  const { user, role, loading } = useAuth()
  const { accent, setAccent } = useThemeAccent()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const setAsSiteDefault = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultThemeAccent: accent }),
      })
      if (res.ok) setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const isAdmin = role !== null && ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])
  const isHome = pathname === "/" || pathname === "" || pathname?.replace(/\/$/, "") === ""
  const showBar = !loading && !!user && isAdmin && isHome

  if (!showBar) return null

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-full border border-border/80 bg-card/95 px-4 py-2.5 shadow-lg backdrop-blur-md"
      role="toolbar"
      aria-label="Tema rengi seçici"
    >
      <span className="text-muted-foreground mr-1 hidden text-xs font-medium sm:inline">
        Renk:
      </span>
      <div className="flex items-center gap-2">
        {ACCENT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setAccent(opt.value)}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-foreground/20",
              opt.bgClass,
              accent === opt.value
                ? "ring-2 ring-foreground/40 ring-offset-2 ring-offset-card"
                : "opacity-80 hover:opacity-100"
            )}
            title={opt.label}
            aria-label={opt.label}
            aria-pressed={accent === opt.value}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={setAsSiteDefault}
        disabled={saving}
        className="ml-1 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground disabled:opacity-50"
      >
        {saving ? "..." : saved ? "Kaydedildi" : "Varsayılanı bu yap"}
      </button>
    </div>
  )
}
