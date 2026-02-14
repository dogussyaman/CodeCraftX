import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Eye, FileText, MessageCircle } from "lucide-react"
import { MdxRenderer } from "@/components/mdx"
import { BlogCommentForm } from "../_components/BlogCommentForm"
import { BlogCommentList } from "../_components/BlogCommentList"
import { BlogLikeButton } from "../_components/BlogLikeButton"
import { BlogViewTracker } from "../_components/BlogViewTracker"

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createServerClient()

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, body, cover_image_url, author_id, published_at, created_at, view_count, like_count, profiles!blog_posts_author_id_fkey(full_name, avatar_url)")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error || !post) notFound()

  const { data: comments } = await supabase
    .from("blog_comments")
    .select("id, post_id, user_id, parent_id, body, created_at, profiles(full_name)")
    .eq("post_id", post.id)
    .order("created_at", { ascending: true })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  let hasLiked = false
  if (user) {
    const { data: likeRow } = await supabase
      .from("blog_post_likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .maybeSingle()
    hasLiked = !!likeRow
  }

  const author = (post as { profiles?: { full_name?: string; avatar_url?: string } | null }).profiles
  const authorName = author?.full_name ?? "CodeCraftX"
  const authorAvatar = author?.avatar_url ?? null
  const viewCount = (post as { view_count?: number }).view_count ?? 0
  const likeCount = (post as { like_count?: number }).like_count ?? 0
  const commentCount = comments?.length ?? 0
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date(post.created_at).toLocaleDateString("tr-TR")

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/blog" className="gap-2">
            <ArrowLeft className="size-4" />
            Tüm yazılar
          </Link>
        </Button>

        <article className="mb-12">
          <BlogViewTracker postId={post.id} />
          <div className="relative w-full aspect-video max-h-[420px] rounded-xl overflow-hidden bg-muted mb-10">
            {post.cover_image_url ? (
              <img
                src={post.cover_image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/70">
                <FileText className="size-16 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <header className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <Avatar className="size-12 border-2 border-border">
                <AvatarImage src={authorAvatar ?? undefined} />
                <AvatarFallback className="text-base">
                  {authorName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{authorName}</p>
                <time dateTime={post.published_at ?? post.created_at} className="text-sm">
                  {publishedDate}
                </time>
              </div>
              <div className="flex flex-wrap items-center gap-3 border-l border-border pl-4">
                <span className="flex items-center gap-1.5 text-sm" title="Görüntülenme">
                  <Eye className="size-4" />
                  {viewCount}
                </span>
                <BlogLikeButton
                  postId={post.id}
                  initialLikeCount={likeCount}
                  initialHasLiked={hasLiked}
                  className="h-8"
                />
                <span className="flex items-center gap-1.5 text-sm" title="Yorum">
                  <MessageCircle className="size-4" />
                  {commentCount}
                </span>
              </div>
            </div>
          </header>
          <MdxRenderer content={post.body} />
        </article>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Yorumlar</h2>
          <BlogCommentForm postId={post.id} />
          <BlogCommentList
            postId={post.id}
            comments={(comments ?? []).map((c) => ({
              id: c.id,
              post_id: c.post_id,
              user_id: c.user_id,
              parent_id: c.parent_id,
              body: c.body,
              created_at: c.created_at,
              authorName: (c as { profiles?: { full_name?: string } | null }).profiles?.full_name ?? "Kullanıcı",
            }))}
          />
        </section>
      </div>
    </div>
  )
}
