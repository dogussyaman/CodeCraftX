import { notFound } from "next/navigation"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, FileText } from "lucide-react"
import { BlogCommentForm } from "../_components/BlogCommentForm"
import { BlogCommentList } from "../_components/BlogCommentList"

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createServerClient()

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, body, cover_image_url, author_id, published_at, created_at, profiles!blog_posts_author_id_fkey(full_name, avatar_url)")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error || !post) notFound()

  const { data: comments } = await supabase
    .from("blog_comments")
    .select("id, post_id, user_id, parent_id, body, created_at, profiles(full_name)")
    .eq("post_id", post.id)
    .order("created_at", { ascending: true })

  const author = (post as { profiles?: { full_name?: string; avatar_url?: string } | null }).profiles
  const authorName = author?.full_name ?? "CodeCrafters"
  const authorAvatar = author?.avatar_url ?? null
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
            <div className="flex items-center gap-4 text-muted-foreground">
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
            </div>
          </header>
          <div
            className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.body.replace(/\n/g, "<br />") }}
          />
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
