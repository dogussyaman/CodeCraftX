"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

interface ThemeToggleProps {
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

export function ThemeToggle({ showLabel = false, size = "sm" }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  const sizeConfig = {
    sm: {
      button: "h-8 w-8",
      icon: "h-4 w-4",
    },
    md: {
      button: "h-9 w-9",
      icon: "h-4 w-4",
    },
    lg: {
      button: "h-10 w-10",
      icon: "h-5 w-5",
    },
  }

  const config = sizeConfig[size]

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${config.button} rounded-lg bg-muted/30 border border-border opacity-70`} />
        {showLabel && <span className="text-sm text-muted-foreground">Tema</span>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-pressed={isDark}
        aria-label={isDark ? "Açık temaya geç" : "Koyu temaya geç"}
        onClick={toggleTheme}
        className={`
          ${config.button}
          relative inline-flex items-center justify-center shrink-0
          cursor-pointer rounded-lg border border-accent-500/25
          transition-all duration-300 ease-out
          hover:bg-accent-100/60 hover:text-accent-700 active:scale-95 dark:hover:bg-accent-500/20 dark:hover:text-accent-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background
          ${isDark
            ? "bg-accent-500/10 text-muted-foreground hover:text-foreground"
            : "bg-background text-muted-foreground hover:text-foreground"
          }
        `}
      >
        <span
          className={`
            relative inline-flex items-center justify-center
            transition-all duration-500 ease-out
          `}
        >
          <Sun
            className={`
              ${config.icon}
              transition-all duration-300 ease-out
              ${isDark
                ? "opacity-0 scale-0 rotate-90"
                : "opacity-100 scale-100 rotate-0"
              }
            `}
          />
          <Moon
            className={`
              ${config.icon}
              absolute
              transition-all duration-300 ease-out
              ${isDark
                ? "opacity-100 scale-100 rotate-0"
                : "opacity-0 scale-0 -rotate-90"
              }
            `}
          />
        </span>
      </button>

      {showLabel && (
        <span className="text-sm text-muted-foreground transition-all duration-700">
          {isDark ? "Koyu" : "Açık"}
        </span>
      )}
    </div>
  )
}
