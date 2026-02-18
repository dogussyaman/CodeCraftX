"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

const STORAGE_KEY = "theme-accent"
export type ThemeAccent = "orange" | "blue" | "purple" | "green" | "red"

const ACCENT_VALUES: ThemeAccent[] = ["orange", "blue", "purple", "green", "red"]

function getStored(): ThemeAccent | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeAccent | null
  return stored && ACCENT_VALUES.includes(stored) ? stored : null
}

type ThemeAccentContextValue = {
  accent: ThemeAccent
  setAccent: (accent: ThemeAccent) => void
}

const ThemeAccentContext = createContext<ThemeAccentContextValue | null>(null)

export function ThemeAccentProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<ThemeAccent>("blue")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = getStored()
    if (stored) {
      setAccentState(stored)
      setMounted(true)
      return
    }
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((data) => {
        const serverDefault = data?.defaultThemeAccent
        const value =
          serverDefault && ACCENT_VALUES.includes(serverDefault as ThemeAccent)
            ? (serverDefault as ThemeAccent)
            : "blue"
        setAccentState(value)
      })
      .catch(() => setAccentState("blue"))
      .finally(() => setMounted(true))
  }, [])

  const applyThemeToDom = useCallback((value: ThemeAccent) => {
    if (typeof window === "undefined") return
    const root = document.documentElement
    ACCENT_VALUES.forEach((a) => root.classList.remove(`theme-${a}`))
    root.classList.add(`theme-${value}`)
  }, [])

  const setAccent = useCallback((value: ThemeAccent) => {
    setAccentState(value)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, value)
      applyThemeToDom(value)
    }
  }, [applyThemeToDom])

  useEffect(() => {
    if (!mounted) return
    applyThemeToDom(accent)
    return () => {
      const root = document.documentElement
      ACCENT_VALUES.forEach((a) => root.classList.remove(`theme-${a}`))
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
