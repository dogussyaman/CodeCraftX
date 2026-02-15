import type { NormalizedNewsItem } from "./types"

const DESCRIPTION_MAX = 200
const DESCRIPTION_DISPLAY_MAX = 140

/**
 * Strip HTML tags from a string.
 */
export function stripHtml(html: string): string {
  if (!html || typeof html !== "string") return ""
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

/**
 * Truncate text to max length (server-side).
 */
export function truncate(text: string, maxLen: number): string {
  if (!text || typeof text !== "string") return ""
  const cleaned = text.trim()
  if (cleaned.length <= maxLen) return cleaned
  return cleaned.slice(0, maxLen).trim().replace(/\s+\S*$/, "") + "…"
}

/**
 * Truncate description for storage (200 chars).
 */
export function truncateDescription(desc: string): string {
  return truncate(stripHtml(desc), DESCRIPTION_MAX)
}

/**
 * Truncate description for card display (140 chars).
 */
export function truncateDescriptionForCard(desc: string): string {
  return truncate(stripHtml(desc), DESCRIPTION_DISPLAY_MAX)
}

/**
 * Normalize date to ISO string.
 */
export function toIsoDate(value: string | Date | null | undefined): string {
  if (!value) return new Date().toISOString()
  const d = typeof value === "string" ? new Date(value) : value
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

/**
 * Generate a stable id from url and title.
 */
export function newsId(url: string, title: string, source: string): string {
  const str = `${source}:${url}:${title}`
  let h = 0
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i)
    h = (h << 5) - h + c
    h |= 0
  }
  return `n-${Math.abs(h).toString(36)}`
}

/**
 * Validate item has required fields; return null if invalid.
 */
export function filterInvalidItems<T extends { title?: string | null; url?: string | null }>(
  items: T[]
): T[] {
  return items.filter((item) => {
    const title = (item.title ?? "").trim()
    const url = (item.url ?? "").trim()
    return title.length > 0 && url.length > 0
  })
}

export { DESCRIPTION_MAX, DESCRIPTION_DISPLAY_MAX }
