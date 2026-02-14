import Link from "next/link"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, FileText, ExternalLink, BookOpen, Eye, Heart, MessageCircle } from "lucide-react"
import { BlogPostDeleteButton } from "@/app/dashboard/admin/blog/_components/BlogPostDeleteButton"

export default async function YazilarimPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/giris")

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, body, status, published_at, created_at, cover_image_url, view_count, like_count")
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false })

  const postIds = (posts ?? []).map((p) => p.id)
  const commentCounts: Record<string, number> = {}
  if (postIds.length > 0) {
    const { data: comments } = await supabase
      .from("blog_comments")
      .select("post_id")
      .in("post_id", postIds)
    for (const id of postIds) commentCounts[id] = 0
    for (const c of comments ?? []) commentCounts[c.post_id] = (commentCounts[c.post_id] ?? 0) + 1
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Yazılarım</h1>
          <p className="text-muted-foreground">Blog yazılarınızı yönetin ve yayınlayın.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/gelistirici/yazilarim/yeni" className="gap-2">
            <Plus className="size-4" />
            Yeni yazı
          </Link>
        </Button>
      </div>

      {!posts?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Henüz yazı eklemediniz.</p>
            <Button asChild>
              <Link href="/dashboard/gelistirici/yazilarim/yeni" className="gap-2">
                <Plus className="size-4" />
                İlk yazınızı oluşturun
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => {
            const coverImageUrl = (post as { cover_image_url?: string | null }).cover_image_url
            const bodyText = typeof (post as { body?: string }).body === "string" ? (post as { body: string }).body : ""
            const excerpt = bodyText.replace(/\n/g, " ").trim().slice(0, 120) + (bodyText.length > 120 ? "..." : "")
            return (
              <Card key={post.id} className="flex flex-col overflow-hidden pt-0">
                <div className="aspect-video w-full overflow-hidden bg-muted border-b border-border">
                  {coverImageUrl ? (
                    <img src={coverImageUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center text-muted-foreground/50">
                      <BookOpen className="size-12" />
                    </div>
                  )}
                </div>
                <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-base">{post.title}</CardTitle>
                    <CardDescription className="mt-1">
                      /blog/{post.slug} ·{" "}
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("tr-TR")
                        : new Date(post.created_at).toLocaleDateString("tr-TR")}
                    </CardDescription>
                    {excerpt ? (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{excerpt}</p>
                    ) : null}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1" title="Görüntülenme">
                        <Eye className="size-3.5" />
                        {(post as { view_count?: number }).view_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1" title="Beğeni">
                        <Heart className="size-3.5" />
                        {(post as { like_count?: number }).like_count ?? 0}
                      </span>
                      <span className="flex items-center gap-1" title="Yorum">
                        <MessageCircle className="size-3.5" />
                        {commentCounts[post.id] ?? 0}
                      </span>
                    </div>
                  </div>
                  <Badge variant={post.status === "published" ? "default" : "secondary"} className="shrink-0">
                    {post.status === "published" ? "Yayında" : "Taslak"}
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/blog/${post.slug}`} target="_blank" className="gap-1">
                      <ExternalLink className="size-3.5" />
                      Görüntüle
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/gelistirici/yazilarim/${post.id}/duzenle`} className="gap-1">
                      <Pencil className="size-3.5" />
                      Düzenle
                    </Link>
                  </Button>
                  {post.status === "published" && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/blog/${post.slug}`} target="_blank" className="gap-1">
                        <ExternalLink className="size-3.5" />
                        Görüntüle
                      </Link>
                    </Button>
                  )}
                  <BlogPostDeleteButton postId={post.id} postTitle={post.title} />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
