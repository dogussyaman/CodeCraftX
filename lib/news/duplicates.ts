import type { NormalizedNewsItem } from "./types"

/**
 * Normalize title for similarity: lowercase, collapse spaces, remove punctuation.
 */
function normalizeTitleForCompare(title: string): string {
  return (title || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * Simple similarity: check if one title contains the other (after normalization)
 * or if they share a significant common prefix. Used to drop near-duplicates.
 */
function areTitlesSimilar(a: string, b: string): boolean {
  const na = normalizeTitleForCompare(a)
  const nb = normalizeTitleForCompare(b)
  if (na === nb) return true
  if (na.length < 10 || nb.length < 10) return false
  if (na.includes(nb) || nb.includes(na)) return true
  const wordsA = new Set(na.split(" ").filter((w) => w.length > 2))
  const wordsB = nb.split(" ").filter((w) => w.length > 2)
  const overlap = wordsB.filter((w) => wordsA.has(w)).length
  const ratio = wordsB.length > 0 ? overlap / wordsB.length : 0
  return ratio >= 0.7
}

/**
 * Remove duplicates by title similarity; keep first occurrence (by publishedAt desc).
 */
export function removeDuplicateNews(items: NormalizedNewsItem[]): NormalizedNewsItem[] {
  const seen: NormalizedNewsItem[] = []
  for (const item of items) {
    const isDup = seen.some((s) => areTitlesSimilar(s.title, item.title))
    if (!isDup) seen.push(item)
  }
  return seen
}
