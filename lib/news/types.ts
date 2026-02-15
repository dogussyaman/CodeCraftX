/**
 * Normalized news item used across RSS and NewsAPI sources.
 */
export interface NormalizedNewsItem {
  id: string
  title: string
  description: string
  content: string | null
  image: string | null
  url: string
  source: string
  language: "tr" | "en"
  publishedAt: string
  category: "turkish" | "global"
}

export type NewsCategory = "turkish" | "global"

export interface AggregatedNews {
  turkish: NormalizedNewsItem[]
  global: NormalizedNewsItem[]
  all: NormalizedNewsItem[]
}

export const SOURCE_BADGE_COLORS: Record<string, string> = {
  Webrazzi: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
  ShiftDelete: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  "BT Haber": "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  TechCrunch: "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30",
  "The Verge": "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
  "Ars Technica": "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  Wired: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30",
  "NewsAPI TR": "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
  "NewsAPI EN": "bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/30",
}
