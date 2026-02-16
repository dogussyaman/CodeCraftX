"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

const STORAGE_KEY = "theme-accent"
export type ThemeAccent = "orange" | "blue" | "purple" | "green" | "red"

const ACCENT_VALUES: ThemeAccent[] = ["orange", "blue", "purple", "green", "red"]

function getStored(): ThemeAccent {
  if (typeof window === "undefined") return "orange"
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeAccent | null
  return stored && ACCENT_VALUES.includes(stored) ? stored : "orange"
}

type ThemeAccentContextValue = {
  accent: ThemeAccent
  setAccent: (accent: ThemeAccent) => void
}

const ThemeAccentContext = createContext<ThemeAccentContextValue | null>(null)

export function ThemeAccentProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<ThemeAccent>("orange")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setAccentState(getStored())
    setMounted(true)
  }, [])

  const applyThemeToDom = useCallback((value: ThemeAccent) => {
    if (typeof window === "undefined") return
    const root = document.documentElement
    ACCENT_VALUES.forEach((a) => root.classList.remove(`theme-${a}`))
    root.classList.add(`theme-${value}`)
    console.log("[ThemeAccent] DOM güncellendi:", {
      theme: value,
      htmlClasses: root.className,
      computedAccent500: getComputedStyle(root).getPropertyValue("--theme-accent-500").trim() || "(yok)",
    })
  }, [])

  const setAccent = useCallback((value: ThemeAccent) => {
    console.log("[ThemeAccent] setAccent çağrıldı:", value)
    setAccentState(value)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, value)
      applyThemeToDom(value)
    }
  }, [applyThemeToDom])

  useEffect(() => {
    if (!mounted) return
    console.log("[ThemeAccent] Provider mount/effect – accent:", accent, "mounted:", mounted)
    applyThemeToDom(accent)
    return () => {
      const root = document.documentElement
      ACCENT_VALUES.forEach((a) => root.classList.remove(`theme-${a}`))
      console.log("[ThemeAccent] Provider unmount – tema sınıfları kaldırıldı")
    }
  }, [accent, mounted, applyThemeToDom])

  const value: ThemeAccentContextValue = { accent, setAccent }
  return (
    <ThemeAccentContext.Provider value={value}>
      {children}
    </ThemeAccentContext.Provider>
  )
}

export function useThemeAccent() {
  const ctx = useContext(ThemeAccentContext)
  if (!ctx) throw new Error("useThemeAccent must be used within ThemeAccentProvider")
  return ctx
}
