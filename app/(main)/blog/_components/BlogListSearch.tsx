"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight, Eye, FileText, Heart, MessageCircle, Search } from "lucide-react"
import { Label } from "@/components/ui/label"
import { BlogPagination } from "./BlogPagination"

const PER_PAGE = 12

export type PostRow = {
  id: string
  title: string
  slug: string
  body: string | null
  cover_image_url: string | null
  published_at: string | null
  created_at: string
  view_count?: number
  like_count?: number
  profiles?: { full_name?: string; avatar_url?: string } | null
}

interface BlogListSearchProps {
  initialPosts: PostRow[]
  commentCounts?: Record<string, number>
  render?: (filteredPosts: PostRow[]) => React.ReactNode
}

export function BlogListSearch({
  initialPosts,
  commentCounts = {},
  render,
}: BlogListSearchProps) {
  const searchParams = useSearchParams()
  const pageFromUrl = Number(searchParams.get("page")) || 1
  const currentPage = Math.max(1, pageFromUrl)
  const [q, setQ] = useState("")

  const filteredPosts = useMemo(() => {
    const lower = q.toLowerCase().trim()
    if (!lower) return initialPosts
    return initialPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(lower) ||
        (post.body ?? "").toLowerCase().includes(lower)
    )
  }, [initialPosts, q])

  const totalPages = Math.ceil(filteredPosts.length / PER_PAGE) || 1
  const paginatedPosts = useMemo(
    () =>
      filteredPosts.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE),
    [filteredPosts, currentPage]
  )

  if (render) {
    return (
      <>
        <div className="mb-8 max-w-md">
          <Label htmlFor="blog-search" className="sr-only">
            Yazı ara
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="blog-search"
              type="search"
              placeholder="Başlık veya içerik ara..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        {render(filteredPosts)}
      </>
    )
  }

  if (!filteredPosts.length) {
    return (
      <>
        <section className="mb-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-primary" />
              <h2 className="text-xl font-semibold tracking-tight">Tüm yazılar</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-56 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="blog-search"
                  type="search"
                  placeholder="Yazı ara..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="rounded-xl border-border/80 bg-muted/30 pl-9"
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">En yeni</span>
            </div>
          </div>
        </section>
        <Card className="rounded-2xl border-border/70">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {q ? "Arama sonucu bulunamadı." : "Henüz yayınlanmış yazı yok."}
            </p>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <section className="mb-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-primary" />
            <h2 className="text-xl font-semibold tracking-tight">Tüm yazılar</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-56 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="blog-search"
                type="search"
                placeholder="Yazı ara..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="rounded-xl border-border/80 bg-muted/30 pl-9 focus-visible:ring-primary/30"
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">En yeni</span>
          </div>
        </div>
      </section>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedPosts.map((post) => {
          const authorName = post.profiles?.full_name ?? "CodeCraftX"
          const avatarUrl = post.profiles?.avatar_url ?? null
          const dateStr = post.published_at
            ? new Date(post.published_at).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : new Date(post.created_at).toLocaleDateString("tr-TR")
          const excerpt = (post.body || "")
            .replace(/#{1,6}\s/g, "")
            .slice(0, 140)
          return (
            <li key={post.id}>
              <Card className="group relative pt-0 h-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-md hover:-translate-y-0.5">
                <div className="absolute left-0 top-0 h-full w-0 rounded-l-2xl bg-primary/80 transition-all duration-300 group-hover:w-1" aria-hidden />
                <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-muted">
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/90 bg-[linear-gradient(to_right,var(--muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--muted)_1px,transparent_1px)] bg-[size:20px_20px]">
                        <FileText className="size-14 text-muted-foreground/40" strokeWidth={1.25} />
                      </div>
                    )}
                  </div>
                  <CardHeader className="flex-1 space-y-2.5 px-4 pt-4 pb-1">
                    <CardTitle className="line-clamp-2 text-base font-semibold leading-tight tracking-tight transition-colors group-hover:text-primary">
                      {post.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar className="size-6 shrink-0 border border-border/50">
                        <AvatarImage src={avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-muted text-[9px] font-medium">
                          {authorName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate font-medium text-foreground/80">{authorName}</span>
                      <span className="text-muted-foreground/70">·</span>
                      <time dateTime={post.published_at ?? post.created_at} className="shrink-0">
                        {dateStr}
                      </time>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0">
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {excerpt}…
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1" title="Görüntülenme">
                        <Eye className="size-3.5" />
                        {(post as { view_count?: number }).view_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1 text-red-500" title="Beğeni">
                        <Heart className="size-3.5" />
                        {(post as { like_count?: number }).like_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1" title="Yorum">
                        <MessageCircle className="size-3.5" />
                        {commentCounts[post.id] ?? 0}
                      </span>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all group-hover:gap-2">
                      Devamını oku
                      <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </CardContent>
                </Link>
              </Card>
            </li>
          )
        })}
      </ul>
      <BlogPagination
        totalPages={totalPages}
        currentPage={currentPage}
        searchQuery={q}
      />
    </>
  )
}
