import { unstable_cache } from "next/cache"
import type { NormalizedNewsItem, AggregatedNews } from "./types"
import { fetchAllRssFeeds } from "./rss-fetcher"
import { fetchNewsApiBoth } from "./newsapi-fetcher"
import { removeDuplicateNews } from "./duplicates"

const LIMIT_PER_CATEGORY = 30
const REVALIDATE_SECONDS = 900

export type { AggregatedNews }

function sortByPublishedDesc(items: NormalizedNewsItem[]): NormalizedNewsItem[] {
  return [...items].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

function limit(items: NormalizedNewsItem[], max: number): NormalizedNewsItem[] {
  return items.slice(0, max)
}

async function aggregateNewsUncached(): Promise<AggregatedNews> {
  const apiKey = process.env.NEWS_API_KEY ?? ""

  const [rssItems, newsApiResult] = await Promise.all([
    fetchAllRssFeeds(),
    apiKey ? fetchNewsApiBoth(apiKey) : Promise.resolve({ tr: [] as NormalizedNewsItem[], en: [] as NormalizedNewsItem[] }),
  ])

  const rssTurkish = rssItems.filter((i) => i.category === "turkish")
  const rssGlobal = rssItems.filter((i) => i.category === "global")
  const turkishRaw = [...rssTurkish, ...newsApiResult.tr]
  const globalRaw = [...rssGlobal, ...newsApiResult.en]

  const turkishSorted = sortByPublishedDesc(turkishRaw)
  const turkishDeduped = removeDuplicateNews(turkishSorted)
  const turkish = limit(turkishDeduped, LIMIT_PER_CATEGORY)

  const globalSorted = sortByPublishedDesc(globalRaw)
  const globalDeduped = removeDuplicateNews(globalSorted)
  const global = limit(globalDeduped, LIMIT_PER_CATEGORY)

  const allSorted = sortByPublishedDesc([...turkish, ...global])
  const allDeduped = removeDuplicateNews(allSorted)
  const all = limit(allDeduped, LIMIT_PER_CATEGORY * 2)

  return { turkish, global, all }
}

/**
 * Fetch all sources in parallel, merge by category, dedupe, sort, limit.
 * Cached 900s. Graceful degradation: failed sources are logged, not thrown.
 */
export const getAggregatedNews = unstable_cache(
  aggregateNewsUncached,
  ["news-aggregate"],
  { revalidate: REVALIDATE_SECONDS }
)

/**
 * Find a single news item by id (searches all categories). For detail page.
 */
export async function getNewsById(id: string): Promise<NormalizedNewsItem | null> {
  const data = await getAggregatedNews()
  const found =
    data.all.find((i) => i.id === id) ??
    data.turkish.find((i) => i.id === id) ??
    data.global.find((i) => i.id === id)
  return found ?? null
}
