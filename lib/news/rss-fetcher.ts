import Parser from "rss-parser"
import type { NormalizedNewsItem } from "./types"
import {
  stripHtml,
  truncateDescription,
  toIsoDate,
  newsId,
  filterInvalidItems,
} from "./normalize"

const FETCH_TIMEOUT_MS = 5000

export const RSS_SOURCES: { url: string; source: string; language: "tr" | "en" }[] = [
  { url: "https://webrazzi.com/feed/", source: "Webrazzi", language: "tr" },
  { url: "https://shiftdelete.net/feed", source: "ShiftDelete", language: "tr" },
  { url: "https://www.bthaber.com/feed", source: "BT Haber", language: "tr" },
]

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ])
}

async function fetchRssFeed(
  url: string,
  source: string,
  language: "tr" | "en"
): Promise<NormalizedNewsItem[]> {
  const parser = new Parser({
    timeout: FETCH_TIMEOUT_MS,
    headers: { "User-Agent": "CodeCraftX-News/1.0" },
  })
  const feed = await withTimeout(parser.parseURL(url), FETCH_TIMEOUT_MS)
  const items: NormalizedNewsItem[] = []
  for (const entry of feed.items ?? []) {
    const title = (entry.title ?? "").trim()
    const link = (entry.link ?? entry.guid ?? "").trim()
    if (!title || !link) continue
    const rawDesc = entry.contentSnippet ?? entry.content ?? entry.summary ?? ""
    const description = truncateDescription(rawDesc)
    const pubDate = entry.pubDate ?? entry.isoDate ?? ""
    let image: string | null = null
    if (entry.enclosure?.url && String(entry.enclosure.url).startsWith("http")) {
      image = String(entry.enclosure.url)
    } else if (typeof entry.content === "string") {
      const imgMatch = entry.content.match(/<img[^>]+src="([^"]+)"/)
      if (imgMatch?.[1]?.startsWith("http")) image = imgMatch[1]
    }
    items.push({
      id: newsId(link, title, source),
      title,
      description,
      content: entry.content ? stripHtml(entry.content) : null,
      image: image && image.startsWith("http") ? image : null,
      url: link,
      source,
      language,
      publishedAt: toIsoDate(pubDate),
      category: "turkish",
    })
  }
  return filterInvalidItems(items)
}

/**
 * Fetch all RSS feeds in parallel with timeout; return combined items, log failures.
 */
export async function fetchAllRssFeeds(): Promise<NormalizedNewsItem[]> {
  const results = await Promise.allSettled(
    RSS_SOURCES.map(({ url, source, language }) =>
      fetchRssFeed(url, source, language)
    )
  )
  const all: NormalizedNewsItem[] = []
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      all.push(...result.value)
    } else {
      console.warn(`[news] RSS source failed: ${RSS_SOURCES[i]?.source ?? "unknown"}`, result.reason)
    }
  })
  return all
}
