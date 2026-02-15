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

/** Türkçe ve İngilizce yazılım / teknoloji haber kaynakları */
export const RSS_SOURCES: { url: string; source: string; language: "tr" | "en" }[] = [
  // Türkçe
  { url: "https://webrazzi.com/feed/", source: "Webrazzi", language: "tr" },
  { url: "https://shiftdelete.net/feed", source: "ShiftDelete", language: "tr" },
  { url: "https://www.bthaber.com/feed", source: "BT Haber", language: "tr" },
  { url: "https://www.donanimhaber.com/rss/tum/", source: "DonanımHaber", language: "tr" },
  // İngilizce (yazılım / tech)
  { url: "https://techcrunch.com/feed/", source: "TechCrunch", language: "en" },
  { url: "https://www.theverge.com/rss/index.xml", source: "The Verge", language: "en" },
  { url: "https://feeds.arstechnica.com/arstechnica/index", source: "Ars Technica", language: "en" },
  { url: "https://www.wired.com/feed/rss", source: "Wired", language: "en" },
  { url: "https://thenextweb.com/feed", source: "The Next Web", language: "en" },
]

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ])
}

/** Extract first image URL from HTML; tries src, data-src, single/double quotes. */
function extractImageFromHtml(html: string | null | undefined): string | null {
  if (!html || typeof html !== "string") return null
  const patterns = [
    /<img[^>]+src=["'](https?:\/\/[^"']+)["']/i,
    /<img[^>]+data-src=["'](https?:\/\/[^"']+)["']/i,
    /<img[^>]+data-lazy-src=["'](https?:\/\/[^"']+)["']/i,
    /(?:content|url)=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^"']*)?)["']/i,
  ]
  for (const re of patterns) {
    const m = html.match(re)
    if (m?.[1]?.startsWith("http")) return m[1]
  }
  return null
}

async function fetchRssFeed(
  url: string,
  source: string,
  language: "tr" | "en"
): Promise<NormalizedNewsItem[]> {
  const parser = new Parser({
    timeout: FETCH_TIMEOUT_MS,
    headers: { "User-Agent": "CodeCraftX-News/1.0" },
    customFields: {
      item: [
        ["media:content", "mediaContent"],
        ["media:thumbnail", "mediaThumbnail"],
        ["content:encoded", "contentEncoded"],
      ],
    },
  })
  const feed = await withTimeout(parser.parseURL(url), FETCH_TIMEOUT_MS)
  const items: NormalizedNewsItem[] = []
  const category: "turkish" | "global" = language === "tr" ? "turkish" : "global"

  for (const entry of feed.items ?? []) {
    const title = (entry.title ?? "").trim()
    const link = (entry.link ?? entry.guid ?? "").trim()
    if (!title || !link) continue
    const rawContent = (entry as { contentEncoded?: string }).contentEncoded ?? entry.content ?? ""
    const rawDesc = entry.contentSnippet ?? entry.content ?? entry.summary ?? ""
    const description = truncateDescription(rawDesc)
    const pubDate = entry.pubDate ?? entry.isoDate ?? ""

    let image: string | null = null
    if (entry.enclosure?.url && String(entry.enclosure.url).startsWith("http")) {
      image = String(entry.enclosure.url)
    }
    if (!image) {
      const mediaContent = (entry as { mediaContent?: string }).mediaContent
      if (typeof mediaContent === "string") {
        const urlMatch = mediaContent.match(/url=["'](https?:\/\/[^"']+)["']/i)
        if (urlMatch?.[1]) image = urlMatch[1]
      }
    }
    if (!image) {
      const mediaThumb = (entry as { mediaThumbnail?: string }).mediaThumbnail
      if (typeof mediaThumb === "string") {
        const urlMatch = mediaThumb.match(/url=["'](https?:\/\/[^"']+)["']/i)
        if (urlMatch?.[1]) image = urlMatch[1]
      }
    }
    if (!image && (rawContent || entry.content)) {
      image = extractImageFromHtml(String(rawContent || entry.content))
    }
    if (image && !image.startsWith("http")) image = null

    items.push({
      id: newsId(link, title, source),
      title,
      description,
      content: entry.content ? stripHtml(entry.content) : null,
      image,
      url: link,
      source,
      language,
      publishedAt: toIsoDate(pubDate),
      category,
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
