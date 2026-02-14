import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, FileText, BookOpen } from "lucide-react"
import { BlogPostDeleteButton } from "./_components/BlogPostDeleteButton"

export default async function AdminBlogPage() {
  const supabase = await createServerClient()
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, status, published_at, created_at, cover_image_url, profiles(full_name)")
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <BookOpen className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Blog</h1>
            <p className="text-sm text-muted-foreground">Blog yazılarını yönetin</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/blog/olustur" className="gap-2">
            <Plus className="size-4" />
            Yeni yazı
          </Link>
        </Button>
      </div>

      {!posts?.length ? (
        <Card className="rounded-2xl border-dashed border-border bg-muted/30 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="size-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Henüz yazı yok</h3>
            <p className="text-muted-foreground mb-4">İlk blog yazınızı oluşturun</p>
            <Button asChild>
              <Link href="/dashboard/admin/blog/olustur" className="gap-2">
                <Plus className="size-4" />
                İlk yazıyı oluştur
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="rounded-2xl border border-border bg-card shadow-sm flex flex-col overflow-hidden pt-0">
              <div className="aspect-video w-full overflow-hidden bg-muted border-b border-border">
                {(post as { cover_image_url?: string | null }).cover_image_url ? (
                  <img
                    src={(post as { cover_image_url: string }).cover_image_url}
                    alt=""
                    className="size-full object-cover"
                  />
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
                    /blog/{post.slug} · {(post as { profiles?: { full_name?: string } | null }).profiles?.full_name ?? "—"} ·{" "}
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString("tr-TR")
                      : new Date(post.created_at).toLocaleDateString("tr-TR")}
                  </CardDescription>
                </div>
                <Badge variant={post.status === "published" ? "default" : "secondary"} className="shrink-0">
                  {post.status === "published" ? "Yayında" : "Taslak"}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pt-0">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/admin/blog/${post.id}/duzenle`} className="gap-1">
                    <Pencil className="size-3.5" />
                    Düzenle
                  </Link>
                </Button>
                {post.status === "published" && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      Görüntüle
                    </Link>
                  </Button>
                )}
                <BlogPostDeleteButton postId={post.id} postTitle={post.title} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
