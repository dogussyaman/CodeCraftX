"use client"

import { cn } from "@/lib/utils"

export type NewsTabId = "turkish" | "global" | "all"

const TABS: { id: NewsTabId; label: string }[] = [
  { id: "turkish", label: "Türkiye Haberleri" },
  { id: "global", label: "Global Teknoloji" },
  { id: "all", label: "Tümü" },
]

interface NewsTabsProps {
  activeTab: NewsTabId
  onTabChange: (tab: NewsTabId) => void
  className?: string
}

export function NewsTabs({ activeTab, onTabChange, className }: NewsTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Haber kategorileri"
      className={cn("flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1", className)}
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            activeTab === tab.id
              ? "bg-background text-foreground shadow-sm dark:bg-card"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50 dark:hover:bg-card/50"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export { TABS, type NewsTabId }
