import type { NormalizedNewsItem } from "./types"
import {
  truncateDescription,
  toIsoDate,
  newsId,
  filterInvalidItems,
} from "./normalize"

const FETCH_TIMEOUT_MS = 5000
const NEWS_API_BASE = "https://newsapi.org/v2/top-headlines"

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ])
}

interface NewsApiArticle {
  title?: string
  description?: string
  content?: string
  url?: string
  urlToImage?: string
  publishedAt?: string
  source?: { name?: string }
}

interface NewsApiResponse {
  status?: string
  articles?: NewsApiArticle[]
}

async function fetchNewsApi(
  category: string,
  language: string,
  apiKey: string
): Promise<NormalizedNewsItem[]> {
  const params = new URLSearchParams({
    category: "technology",
    language,
    pageSize: "30",
    apiKey,
  })
  const url = `${NEWS_API_BASE}?${params.toString()}`
  const res = await withTimeout(
    fetch(url, { next: { revalidate: 900 } }),
    FETCH_TIMEOUT_MS
  )
  if (!res.ok) {
    throw new Error(`NewsAPI ${res.status}`)
  }
  const data = (await res.json()) as NewsApiResponse
  if (data.status !== "ok" || !Array.isArray(data.articles)) {
    return []
  }
  const categoryType = language === "tr" ? "turkish" : "global"
  const sourceLabel = language === "tr" ? "NewsAPI TR" : "NewsAPI EN"
  const items: NormalizedNewsItem[] = data.articles.map((a: NewsApiArticle) => ({
    id: newsId(a.url ?? "", a.title ?? "", sourceLabel),
    title: (a.title ?? "").trim(),
    description: truncateDescription(a.description ?? a.content ?? ""),
    content: (a.content ?? "").trim() || null,
    image: a.urlToImage && a.urlToImage.startsWith("http") ? a.urlToImage : null,
    url: (a.url ?? "").trim(),
    source: sourceLabel,
    language: language as "tr" | "en",
    publishedAt: toIsoDate(a.publishedAt),
    category: categoryType,
  }))
  return filterInvalidItems(items)
}

/**
 * Fetch NewsAPI Turkish and English in parallel; return { tr, en }. Log failures.
 */
export async function fetchNewsApiBoth(apiKey: string): Promise<{
  tr: NormalizedNewsItem[]
  en: NormalizedNewsItem[]
}> {
  const [tr, en] = await Promise.all([
    fetchNewsApi("technology", "tr", apiKey).catch((err) => {
      console.warn("[news] NewsAPI TR failed", err)
      return []
    }),
    fetchNewsApi("technology", "en", apiKey).catch((err) => {
      console.warn("[news] NewsAPI EN failed", err)
      return []
    }),
  ])
  return { tr, en }
}
