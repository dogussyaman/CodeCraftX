import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRight, Eye, FileText, Heart, MessageCircle, Sparkles } from "lucide-react"

export type FeaturedPost = {
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

interface BlogFeaturedSectionProps {
  posts: FeaturedPost[]
  commentCounts?: Record<string, number>
}

function PostStats({
  viewCount = 0,
  likeCount = 0,
  commentCount = 0,
  className = "",
}: {
  viewCount?: number
  likeCount?: number
  commentCount?: number
  className?: string
}) {
  return (
    <div
      className={`flex items-center gap-4 text-xs text-muted-foreground ${className}`}
      aria-label="Görüntülenme, beğeni ve yorum sayıları"
    >
      <span className="flex items-center gap-1" title="Görüntülenme">
        <Eye className="size-3.5" />
        {viewCount}
      </span>
      <span className="flex items-center gap-1 text-red-500" title="Beğeni">
        <Heart className="size-3.5" />
        {likeCount}
      </span>
      <span className="flex items-center gap-1" title="Yorum">
        <MessageCircle className="size-3.5" />
        {commentCount}
      </span>
    </div>
  )
}

function excerpt(body: string | null, max = 140) {
  if (!body) return ""
  const text = body.replace(/#{1,6}\s/g, "").replace(/\n/g, " ").trim()
  return text.slice(0, max) + (text.length > max ? "…" : "")
}

export function BlogFeaturedSection({ posts, commentCounts = {} }: BlogFeaturedSectionProps) {
  if (!posts.length) return null

  return (
    <section className="mb-12">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-primary" />
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Öne çıkan yazılar
        </h2>
        <Sparkles className="size-4 text-primary/70" aria-hidden />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {posts.map((post) => {
          const authorName = post.profiles?.full_name ?? "CodeCraftX"
          const dateStr = post.published_at
            ? new Date(post.published_at).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : new Date(post.created_at).toLocaleDateString("tr-TR")
          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md md:flex-row"
            >
              <div className="relative h-44 w-full shrink-0 overflow-hidden bg-muted md:h-auto md:w-2/5">
                {post.cover_image_url ? (
                  <img
                    src={post.cover_image_url}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted/80">
                    <FileText className="size-12 text-muted-foreground/40" strokeWidth={1.25} />
                  </div>
                )}
                <span className="absolute left-3 top-3 rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-foreground">
                  Öne çıkan
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-center p-4 md:p-5">
                <h3 className="line-clamp-2 text-base font-semibold leading-snug transition-colors group-hover:text-primary md:text-lg">
                  {post.title}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Avatar className="size-5 shrink-0 border border-border/50">
                    <AvatarImage src={post.profiles?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-[8px]">
                      {authorName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{authorName}</span>
                  <span>·</span>
                  <time dateTime={post.published_at ?? post.created_at}>{dateStr}</time>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {excerpt(post.body, 120)}
                </p>
                <PostStats
                  viewCount={(post as { view_count?: number }).view_count ?? 0}
                  likeCount={(post as { like_count?: number }).like_count ?? 0}
                  commentCount={commentCounts[post.id] ?? 0}
                  className="mt-3"
                />
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
                  Devamını oku
                  <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
