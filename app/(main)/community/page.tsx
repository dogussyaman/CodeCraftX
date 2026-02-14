import type { Metadata } from "next"
import Link from "next/link"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { createServerClient } from "@/lib/supabase/server"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CommunityHero } from "./_components/CommunityHero"
import { CommunitySidebar } from "./_components/CommunitySidebar"
import { CommunityFeeds, type FeedPost } from "./_components/CommunityFeeds"
import { CommunityRightSidebar } from "./_components/CommunityRightSidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, BookOpen, Link2 } from "lucide-react"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Topluluk"),
  description:
    "CodeCraftX topluluğu. Discord, GitHub ve LinkedIn bağlantıları. Haberler, blog yazıları ve kaynaklar.",
  path: "/community",
})

const MAX_BLOG_POSTS = 24

export default async function CommunityPage() {
  const supabase = await createServerClient()
  const { data: blogRows } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, body, cover_image_url, published_at, created_at, view_count, like_count, profiles(full_name, avatar_url)"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(MAX_BLOG_POSTS)

  const postIds = (blogRows ?? []).map((p) => p.id)
  let commentCounts: Record<string, number> = {}
  if (postIds.length > 0) {
    const { data: comments } = await supabase
      .from("blog_comments")
      .select("post_id")
      .in("post_id", postIds)
    for (const id of postIds) commentCounts[id] = 0
    for (const c of comments ?? []) {
      commentCounts[c.post_id] = (commentCounts[c.post_id] ?? 0) + 1
    }
  }

  const feedPosts: FeedPost[] = (blogRows ?? []).map((row: any) => {
    const plain = row.body ? String(row.body).replace(/<[^>]*>/g, "").trim() : ""
    const excerpt = plain ? plain.slice(0, 160) + (plain.length > 160 ? "…" : "") : undefined
    return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt,
    cover_image_url: row.cover_image_url,
    published_at: row.published_at,
    created_at: row.created_at,
    view_count: row.view_count,
    like_count: row.like_count,
    author: row.profiles,
    isPinned: false,
    type: "blog",
  }
  })

  return (
    <div className="min-h-screen bg-background">
      <CommunityHero />

      <div className="container mx-auto px-4 py-6 md:py-8">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Ana Sayfa</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Topluluk</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
          <CommunitySidebar />
          <CommunityFeeds posts={feedPosts} commentCounts={commentCounts} />
          <CommunityRightSidebar />
        </div>

        {/* Blog & Kaynaklar bölümü */}
        <section className="mt-16 border-t border-border pt-12">
          <h2 className="text-2xl font-bold text-foreground">
            Blog &amp; Kaynaklar
          </h2>
          <p className="mt-1 text-muted-foreground">
            Güncel yazılar ve rehberlerle kendinizi geliştirin.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card className="overflow-hidden border-border bg-card transition-colors hover:bg-muted/20">
              <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-primary/5" />
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-primary">
                  <FileText className="size-5" />
                  <span className="font-medium">Blog</span>
                </div>
                <h3 className="mt-2 font-semibold text-foreground">
                  Geliştirici yazıları ve deneyimler
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Kariyer ipuçları, teknoloji yazıları ve topluluk deneyimleri.
                </p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/blog">Yazıları oku</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-border bg-card transition-colors hover:bg-muted/20">
              <div className="aspect-video w-full bg-gradient-to-br from-primary/10 to-primary/5" />
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-primary">
                  <BookOpen className="size-5" />
                  <span className="font-medium">API &amp; Dokümantasyon</span>
                </div>
                <h3 className="mt-2 font-semibold text-foreground">
                  Başlarken rehberi
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Entegrasyonlar ve API kullanımı için dokümantasyon.
                </p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href="/destek">Daha fazla</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Entegrasyonlar CTA */}
        <section className="mt-16 rounded-2xl border border-border bg-muted/20 p-8 md:p-12">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Link2 className="size-7" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-foreground">
              Favori araçlarınızla entegre edin
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Topluluğu Discord, GitHub ve LinkedIn ile bağlayın. Haberleri ve
              duyuruları tek yerden takip edin.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link href="#feed">Akışı incele</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/kayit">Ücretsiz katıl</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
