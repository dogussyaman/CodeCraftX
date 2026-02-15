"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Pin,
  MessageCircle,
  Heart,
  Eye,
  FileText,
  Image as ImageIcon,
  Send,
} from "lucide-react"
import type { AggregatedNews } from "@/lib/news/types"
import { NewsCard } from "./news/NewsCard"

export type FeedPost = {
  id: string
  title: string
  slug?: string
  excerpt?: string
  cover_image_url?: string | null
  published_at?: string | null
  created_at: string
  view_count?: number
  like_count?: number
  author?: { full_name?: string; avatar_url?: string } | null
  isPinned?: boolean
  type: "blog" | "announcement"
}

interface CommunityFeedsProps {
  posts: FeedPost[]
  commentCounts?: Record<string, number>
  aggregatedNews?: AggregatedNews | null
}

const FILTER_TABS = [
  { id: "all", label: "Tümü" },
  { id: "trending", label: "Öne çıkan" },
  { id: "duyurular", label: "#Duyurular" },
  { id: "blog", label: "#Blog" },
  { id: "turkish", label: "Türkiye Haberleri" },
  { id: "global", label: "Global Teknoloji" },
  { id: "news-all", label: "Tüm Haberler" },
]

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 60) return `${diffMins} dk önce`
  if (diffHours < 24) return `${diffHours} saat önce`
  if (diffDays < 7) return `${diffDays} gün önce`
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })
}

const NEWS_FILTERS = ["turkish", "global", "news-all"] as const

export function CommunityFeeds({ posts, commentCounts = {}, aggregatedNews }: CommunityFeedsProps) {
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  const isNewsFilter = NEWS_FILTERS.includes(activeFilter as (typeof NEWS_FILTERS)[number])
  const newsItems = useMemo(() => {
    if (!aggregatedNews) return []
    switch (activeFilter) {
      case "turkish":
        return aggregatedNews.turkish
      case "global":
        return aggregatedNews.global
      case "news-all":
        return aggregatedNews.all
      default:
        return []
    }
  }, [activeFilter, aggregatedNews])

  const filteredPosts = useMemo(() => {
    let list = posts
    const q = search.toLowerCase().trim()
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt ?? "").toLowerCase().includes(q)
      )
    }
    if (activeFilter === "trending") {
      list = [...list].sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0))
    }
    if (activeFilter === "blog") {
      list = list.filter((p) => p.type === "blog")
    }
    if (activeFilter === "duyurular") {
      list = list.filter((p) => p.type === "announcement" || p.isPinned)
    }
    return list
  }, [posts, search, activeFilter])

  const pinnedPosts = filteredPosts.filter((p) => p.isPinned)
  const feedPosts = filteredPosts.filter((p) => !p.isPinned)

  return (
    <div id="feed" className="flex min-w-0 flex-1 flex-col gap-6">
      {/* Arama */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Anahtar kelime, #etiket veya @isim ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Gönderi placeholder (görsel olarak) */}
      <Card className="border-border bg-card">
        <CardContent className="flex items-center gap-3 p-4">
          <Avatar className="size-10 shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary">?</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Aklınızdan ne geçiyor? (Giriş yaparak paylaşın)
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="icon" disabled aria-label="Görsel">
              <ImageIcon className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" disabled aria-label="Gönder">
              <Send className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filtre sekmeleri - Tümü, Öne çıkan, #Duyurular, #Blog, haber sekmeleri */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <Button
            key={tab.id}
            variant={activeFilter === tab.id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveFilter(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Sabitlenmiş gönderiler - sadece feed modunda */}
      {!isNewsFilter && pinnedPosts.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Pin className="size-4 text-primary" />
            Sabitlenmiş ({pinnedPosts.length})
          </h3>
          <div className="space-y-3">
            {pinnedPosts.map((post) => (
              <FeedCard
                key={post.id}
                post={post}
                commentCount={commentCounts[post.id] ?? 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Akış veya haber kartları */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Haberler &amp; Yazılar</h3>
        {isNewsFilter ? (
          newsItems.length === 0 ? (
            <Card className="border-dashed border-border bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="size-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Bu kategoride haber yok veya yükleniyor.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {newsItems.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )
        ) : feedPosts.length === 0 ? (
          <Card className="border-dashed border-border bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="size-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                {search || activeFilter !== "all"
                  ? "Bu filtreye uygun içerik bulunamadı."
                  : "Henüz paylaşım yok. Blog ve duyurular burada listelenecek."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {feedPosts.map((post) => (
              <FeedCard
                key={post.id}
                post={post}
                commentCount={commentCounts[post.id] ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FeedCard({
  post,
  commentCount,
}: {
  post: FeedPost
  commentCount: number
}) {
  const href = post.slug ? `/blog/${post.slug}` : "#"
  const authorName = post.author?.full_name ?? "CodeCraftX"

  return (
    <Card className="overflow-hidden border-border bg-card transition-colors hover:bg-muted/20">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarImage src={post.author?.avatar_url} />
            <AvatarFallback className="bg-primary/20 text-primary text-sm">
              {authorName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">{authorName}</span>
              {post.isPinned && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Pin className="size-3" />
                  Sabit
                </Badge>
            )}
              {post.type === "blog" && (
                <Badge variant="outline" className="text-xs">Blog</Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(post.published_at ?? post.created_at)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {post.cover_image_url && (
          <div className="mb-3 overflow-hidden rounded-lg border border-border">
            <img
              src={post.cover_image_url}
              alt=""
              className="aspect-video w-full object-cover"
            />
          </div>
        )}
        <Link href={href} className="block group">
          <h4 className="font-semibold text-foreground group-hover:text-primary group-hover:underline">
            {post.title}
          </h4>
          {post.excerpt && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          )}
        </Link>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="size-4" />
            {post.like_count ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="size-4" />
            {commentCount}
          </span>
          {(post.view_count ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="size-4" />
              {post.view_count}
            </span>
          )}
          <Link
            href={href}
            className="ml-auto text-primary hover:underline"
          >
            Devamını oku
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
