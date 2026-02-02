import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Rss } from "lucide-react"
import { fetchRssFeeds } from "@/lib/rss"

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
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <Rss className="size-10" />
            Yazılım Haberleri
          </h1>
          <p className="text-muted-foreground">
            Gündemden seçilen yazılım ve teknoloji haberleri. Kaynaklar güncel tutulmaktadır.
          </p>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Rss className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Şu an haber yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-4">
            {items.map((item, i) => (
              <li key={`${item.link}-${i}`}>
                <Card className="overflow-hidden transition-colors hover:bg-muted/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg font-medium line-clamp-2">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline focus:underline"
                        >
                          {item.title}
                        </a>
                      </CardTitle>
                      <Button variant="ghost" size="icon" asChild className="shrink-0">
                        <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label="Dış bağlantı">
                          <ExternalLink className="size-4" />
                        </a>
                      </Button>
                    </div>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      {item.source && (
                        <Badge variant="secondary" className="text-xs">
                          {item.source}
                        </Badge>
                      )}
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
