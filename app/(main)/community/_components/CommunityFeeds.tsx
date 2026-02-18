"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
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
  PenLine,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type { AggregatedNews } from "@/lib/news/types"
import { NewsCard } from "./news/NewsCard"

const POSTS_PER_PAGE = 8
const NEWS_PER_PAGE = 12

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

const ROLES_CAN_WRITE_BLOG = ["admin", "developer", "platform_admin"]

interface CommunityFeedsProps {
  posts: FeedPost[]
  commentCounts?: Record<string, number>
  aggregatedNews?: AggregatedNews | null
  isLoggedIn?: boolean
  /** Sadece admin ve developer blog yazısı yazabilsin */
  userRole?: string | null
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

export function CommunityFeeds({ posts, commentCounts = {}, aggregatedNews, isLoggedIn = false, userRole = null }: CommunityFeedsProps) {
  const [search, setSearch] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [composerOpen, setComposerOpen] = useState(false)
  const [feedPage, setFeedPage] = useState(1)
  const [newsPage, setNewsPage] = useState(1)
  const canWriteBlog = Boolean(userRole && ROLES_CAN_WRITE_BLOG.includes(userRole))

  useEffect(() => {
    setFeedPage(1)
    setNewsPage(1)
  }, [activeFilter])

  const scrollToFeedTop = () => {
    const feed = document.getElementById("feed")
    if (feed) {
      feed.scrollIntoView({ behavior: "smooth", block: "start" })
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }
  const handleFeedPageChange = (p: number) => {
    setFeedPage(p)
    setTimeout(scrollToFeedTop, 150)
  }
  const handleNewsPageChange = (p: number) => {
    setNewsPage(p)
    setTimeout(scrollToFeedTop, 150)
  }

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
  const feedTotalPages = Math.max(1, Math.ceil(feedPosts.length / POSTS_PER_PAGE))
  const paginatedFeedPosts = feedPosts.slice(
    (feedPage - 1) * POSTS_PER_PAGE,
    feedPage * POSTS_PER_PAGE
  )
  const newsTotalPages = Math.max(1, Math.ceil(newsItems.length / NEWS_PER_PAGE))
  const paginatedNewsItems = newsItems.slice(
    (newsPage - 1) * NEWS_PER_PAGE,
    newsPage * NEWS_PER_PAGE
  )

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

      {/* Gönderi placeholder / blog yazma alanı */}
      <Card className="overflow-hidden border-border bg-card transition-shadow hover:shadow-sm">
        <CardContent className="p-0">
          {!isLoggedIn ? (
            <Link
              href="/auth/giris"
              className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/30"
            >
              <Avatar className="size-10 shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary">?</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                Aklınızdan ne geçiyor? (Giriş yaparak paylaşın)
              </div>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => canWriteBlog && setComposerOpen((o) => !o)}
                className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/30"
                aria-expanded={composerOpen}
              >
                <Avatar className="size-10 shrink-0">
                  <AvatarFallback className="bg-primary/20 text-primary">?</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  {canWriteBlog
                    ? "Aklınızdan ne geçiyor? (Blog yazısı paylaşmak için tıklayın)"
                    : "Akışı inceleyin. Blog yazısı yazma yetkisi admin ve geliştirici hesaplarına özeldir."}
                </div>
                {canWriteBlog && (
                  <motion.span
                    animate={{ rotate: composerOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                  >
                    <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
                  </motion.span>
                )}
              </button>
              <AnimatePresence initial={false}>
                {canWriteBlog && composerOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="flex flex-col gap-3 p-4">
                      <p className="text-sm text-muted-foreground">
                        Toplulukta bir blog yazısı paylaşmak için aşağıdaki butona tıklayın.
                      </p>
                      <Button size="sm" className="w-full gap-2 sm:w-auto" asChild>
                        <Link href="/dashboard/gelistirici/yazilarim/yeni">
                          <PenLine className="size-4" />
                          Blog yazısı yaz
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </CardContent>
      </Card>

      {/* Filtre sekmeleri - Tümü, Öne çıkan, #Duyurular, #Blog, haber sekmeleri */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <motion.div key={tab.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant={activeFilter === tab.id ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter(tab.id)}
              className="transition-colors duration-200"
            >
              {tab.label}
            </Button>
          </motion.div>
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
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedNewsItems.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
              {newsTotalPages > 1 && (
                <FeedPagination
                  currentPage={newsPage}
                  totalPages={newsTotalPages}
                  onPageChange={handleNewsPageChange}
                  totalItems={newsItems.length}
                  pageSize={NEWS_PER_PAGE}
                />
              )}
            </>
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
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {paginatedFeedPosts.map((post) => (
                <FeedCard
                  key={post.id}
                  post={post}
                  commentCount={commentCounts[post.id] ?? 0}
                />
              ))}
            </div>
            {feedTotalPages > 1 && (
              <FeedPagination
                currentPage={feedPage}
                totalPages={feedTotalPages}
                onPageChange={handleFeedPageChange}
                totalItems={feedPosts.length}
                pageSize={POSTS_PER_PAGE}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function FeedPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (p: number) => void
  totalItems: number
  pageSize: number
}) {
  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)
  if (totalPages <= 1) return null
  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t border-border pt-6"
      aria-label="Sayfa navigasyonu"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="gap-1"
      >
        <ChevronLeft className="size-4" />
        Önceki
      </Button>
      <span className="flex items-center gap-2 px-2 text-sm text-muted-foreground">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            variant={p === currentPage ? "default" : "ghost"}
            size="sm"
            className="min-w-9"
            onClick={() => onPageChange(p)}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </Button>
        ))}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="gap-1"
      >
        Sonraki
        <ChevronRight className="size-4" />
      </Button>
      <span className="text-xs text-muted-foreground">
        {start}–{end} / {totalItems}
      </span>
    </nav>
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
    <Card className="group/card overflow-hidden border-border bg-card pt-0 transition-all duration-300 hover:border-primary/25 hover:shadow-md">
      {post.cover_image_url && (
        <div className="overflow-hidden rounded-t-lg border-0 border-b border-border">
          <img
            src={post.cover_image_url}
            alt=""
            className="aspect-video w-full object-cover transition-transform duration-300 group-hover/card:scale-[1.02]"
          />
        </div>
      )}
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-start gap-3">
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={post.author?.avatar_url} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
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
              <span className="font-medium text-foreground text-sm">{authorName}</span>
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
      <CardContent className="pt-0 pb-4">
        <Link href={href} className="block group">
          <h4 className="font-semibold text-foreground group-hover:text-primary group-hover:underline line-clamp-2">
            {post.title}
          </h4>
          {post.excerpt && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {post.excerpt}
            </p>
          )}
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
          <Link href={href} className="ml-auto text-primary hover:underline">
            Devamını oku
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
