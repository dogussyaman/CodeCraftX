"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import type { NormalizedNewsItem } from "@/lib/news/types"
import { SOURCE_BADGE_COLORS } from "@/lib/news/types"
import { truncateDescriptionForCard } from "@/lib/news/normalize"
import { cn } from "@/lib/utils"

function formatPublishDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return `${diffMins} dk önce`
  if (diffHours < 24) return `${diffHours} saat önce`
  if (diffDays < 7) return `${diffDays} gün önce`
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
}

const badgeClass = (source: string) =>
  cn(
    "border text-[10px] font-medium px-1.5 py-0",
    SOURCE_BADGE_COLORS[source] ?? "bg-muted text-muted-foreground border-border"
  )

interface NewsCardProps {
  item: NormalizedNewsItem
}

export function NewsCard({ item }: NewsCardProps) {
  const description = truncateDescriptionForCard(item.description)
  const href = item.content ? `/news/${encodeURIComponent(item.id)}` : item.url
  const isExternal = !item.content

  return (
    <Card className="group overflow-hidden border-border bg-card pt-0 shadow-sm transition-all duration-200 hover:shadow hover:border-border/80 dark:hover:border-muted">
      <CardContent className="p-0 flex flex-col">
        <Link
          href={href}
          className="block flex-1 min-h-0"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          <div className="relative h-28 w-full shrink-0 overflow-hidden bg-muted">
            {item.image ? (
              <img
                src={item.image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted/60 text-muted-foreground text-xs" />
            )}
          </div>
          <div className="flex flex-col gap-1 p-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge className={badgeClass(item.source)} variant="outline">
                {item.source}
              </Badge>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {formatPublishDate(item.publishedAt)}
              </span>
            </div>
            <h4 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground group-hover:text-primary">
              {item.title}
            </h4>
            {description && (
              <p className="line-clamp-2 text-xs text-muted-foreground leading-snug">
                {description}
              </p>
            )}
          </div>
        </Link>
        <div className="px-2.5 pb-2 pt-0">
          <Link
            href={href}
            className="inline-flex items-center text-xs text-primary hover:underline"
            {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            Devamını oku
            <ExternalLink className="ml-1 size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
