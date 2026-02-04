"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight, FileText, Search } from "lucide-react"
import { Label } from "@/components/ui/label"

type PostRow = {
  id: string
  title: string
  slug: string
  body: string | null
  cover_image_url: string | null
  published_at: string | null
  created_at: string
  profiles?: { full_name?: string; avatar_url?: string } | null
}

interface BlogListSearchProps {
  initialPosts: PostRow[]
  render?: (filteredPosts: PostRow[]) => React.ReactNode
}

export function BlogListSearch({ initialPosts, render }: BlogListSearchProps) {
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

  const searchInput = (
    <div className="w-full md:max-w-md">
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
  )

  const resultSummary = (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold">Tüm Yazılar</h2>
      <p className="text-sm text-muted-foreground">
        {filteredPosts.length} yazı listeleniyor
      </p>
    </div>
  )

  const searchBlock = (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {resultSummary}
      {searchInput}
    </div>
  )

  if (render) {
    return (
      <>
        {searchBlock}
        {render(filteredPosts)}
      </>
    )
  }

  if (!filteredPosts.length) {
    return (
      <>
        {searchBlock}
        <Card>
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
      {searchBlock}
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => {
          const authorName = post.profiles?.full_name ?? "CodeCrafters"
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
              <Card className="group pt-0 h-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-0.5">
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
                  <CardHeader className="flex-1 space-y-3 px-5 pt-5 pb-2">
                    <CardTitle className="line-clamp-2 text-base font-semibold leading-tight tracking-tight transition-colors group-hover:text-primary md:text-lg">
                      {post.title}
                    </CardTitle>
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <Avatar className="size-7 shrink-0 border border-border/50">
                        <AvatarImage src={avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-muted text-[10px] font-medium">
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
                  <CardContent className="px-5 pb-5 pt-0">
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {excerpt}…
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all group-hover:gap-2">
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
    </>
  )
}
