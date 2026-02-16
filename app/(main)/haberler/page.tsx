import type { Metadata } from "next"
import { ExternalLink, Rss } from "lucide-react"

import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { fetchRssFeeds } from "@/lib/rss"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const revalidate = 3600

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Haberler"),
  description: "Yazılım ve teknoloji haberleri. Gündemden seçilen kaynaklar.",
  path: "/haberler",
})

export default async function HaberlerPage() {
  const items = await fetchRssFeeds(15)

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-12">
          <h1 className="mb-2 flex items-center gap-2 text-4xl font-bold tracking-tight">
            <Rss className="size-10" />
            Yazılım Haberleri
          </h1>
          <p className="text-muted-foreground">Gündemden seçilen yazılım ve teknoloji haberleri. Kaynaklar düzenli olarak güncellenir.</p>
        </div>

        {items.length === 0 ? (
          <Card className="border-accent-500/20 bg-white/70 dark:bg-zinc-900/60">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Rss className="mb-4 size-12 text-muted-foreground" />
              <p className="text-muted-foreground">Şu an haber yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-4">
            {items.map((item, i) => (
              <li key={`${item.link}-${i}`}>
                <Card className="overflow-hidden border-accent-500/20 bg-white/70 transition-colors hover:bg-accent-50/70 dark:bg-zinc-900/60 dark:hover:bg-zinc-800/70">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="line-clamp-2 text-lg font-medium">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline focus:underline">
                          {item.title}
                        </a>
                      </CardTitle>
                      <Button variant="ghost" size="icon" asChild className="shrink-0">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label="Dış bağlantı">
                          <ExternalLink className="size-4" />
                        </a>
                      </Button>
                    </div>
                    <CardDescription className="flex flex-wrap items-center gap-2">
                      {item.source && <Badge variant="secondary" className="text-xs">{item.source}</Badge>}
                      {item.pubDate && (
                        <span>
                          {new Date(item.pubDate).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
