/**
 * Minimal RSS 2.0 parser - extracts items (title, link, pubDate) from XML string.
 * No external dependency.
 */
export interface RssItem {
  title: string
  link: string
  pubDate: string | null
  source?: string
}

function stripCdata(s: string): string {
  const trimmed = s.trim()
  if (trimmed.startsWith("<![CDATA[") && trimmed.endsWith("]]>")) {
    return trimmed.slice(9, -3).trim()
  }
  return trimmed
}

function extractTag(xml: string, tag: string): string | null {
  const open = `<${tag}>`
  const close = `</${tag}>`
  const start = xml.indexOf(open)
  if (start === -1) return null
  const end = xml.indexOf(close, start)
  if (end === -1) return null
  const raw = xml.slice(start + open.length, end)
  return stripCdata(raw).replace(/<[^>]+>/g, "").trim()
}

export function parseRssItems(xml: string, source?: string): RssItem[] {
  const items: RssItem[] = []
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
  let m: RegExpExecArray | null
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1]
    const title = extractTag(block, "title") ?? extractTag(block, "title")
    const link = extractTag(block, "link")
    const pubDate = extractTag(block, "pubDate")
    if (title && link) {
      items.push({ title, link, pubDate: pubDate || null, source })
    }
  }
  return items
}

const FEEDS: { url: string; label: string }[] = [
  { url: "https://dev.to/feed", label: "Dev.to" },
  { url: "https://hnrss.org/frontpage", label: "Hacker News" },
  { url: "https://www.techmeme.com/feed.xml", label: "Techmeme" },
]

export async function fetchRssFeeds(maxItemsPerFeed = 10): Promise<RssItem[]> {
  const all: RssItem[] = []
  await Promise.all(
    FEEDS.map(async ({ url, label }) => {
      try {
        const res = await fetch(url, {
          next: { revalidate: 3600 },
          headers: { "User-Agent": "CodeCraftX/1.0" },
        })
        if (!res.ok) return
        const xml = await res.text()
        const items = parseRssItems(xml, label).slice(0, maxItemsPerFeed)
        items.forEach((item) => all.push({ ...item, source: item.source ?? label }))
      } catch {
        // ignore fetch/parse errors
      }
    })
  )
  all.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0
    return db - da
  })
  return all.slice(0, 50)
}
