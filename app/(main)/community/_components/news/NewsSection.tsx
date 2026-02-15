"use client"

import { useMemo, useState } from "react"
import type { NormalizedNewsItem, AggregatedNews } from "@/lib/news/types"
import { NewsTabs, type NewsTabId } from "./NewsTabs"
import { NewsCard } from "./NewsCard"

interface NewsSectionProps {
  data: AggregatedNews
}

export function NewsSection({ data }: NewsSectionProps) {
  const [activeTab, setActiveTab] = useState<NewsTabId>("turkish")

  const items = useMemo(() => {
    switch (activeTab) {
      case "turkish":
        return data.turkish
      case "global":
        return data.global
      case "all":
        return data.all
      default:
        return data.turkish
    }
  }, [activeTab, data])

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Teknoloji Haberleri
        </h2>
        <NewsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
