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
import { getAggregatedNews, type AggregatedNews } from "@/lib/news/aggregate"
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

type AnnouncementRow = {
  id: string
  title: string
  body: string
  created_at: string
  is_pinned?: boolean
  profiles?: { full_name?: string; avatar_url?: string } | { full_name?: string; avatar_url?: string }[] | null
}

export default async function CommunityPage() {
  const supabase = await createServerClient()

  const blogPromise = supabase
    .from("blog_posts")
    .select(
      "id, title, slug, cover_image_url, published_at, created_at, view_count, like_count, profiles(full_name, avatar_url)"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(MAX_BLOG_POSTS)

  const userPromise = supabase.auth.getUser()
  const newsPromise: Promise<AggregatedNews | null> = getAggregatedNews().catch(() => null)

  const [{ data: blogRows }, { data: { user } }] = await Promise.all([blogPromise, userPromise])

  const postIds = (blogRows ?? []).map((p) => p.id)
  const commentsPromise = postIds.length
    ? supabase.from("blog_comments").select("post_id").in("post_id", postIds)
    : Promise.resolve({ data: [] as { post_id: string }[] })

  const feedPostsFromBlog: FeedPost[] = (blogRows ?? []).map((row: any) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: undefined,
    cover_image_url: row.cover_image_url,
    published_at: row.published_at,
    created_at: row.created_at,
    view_count: row.view_count,
    like_count: row.like_count,
    author: row.profiles,
    isPinned: false,
    type: "blog",
  }))

  let events: { id: string; title: string; description?: string | null; location?: string | null; starts_at: string; ends_at?: string | null }[] = []
  let featuredBlogs: { id: string; title: string; slug: string; view_count?: number }[] = []
  let announcements: AnnouncementRow[] = []
  let topics: { slug: string; label: string }[] = []
  let isMember = false
  let canAddTopic = false
  let role: string | undefined
  const commentCounts: Record<string, number> = {}

  try {
    const [commentsRes, eventsRes, featuredRes, announcementsRes, topicsRes, memberRes, profileRes] = await Promise.all([
      commentsPromise,
      supabase
        .from("community_events")
        .select("id, title, description, location, starts_at, ends_at")
        .eq("status", "published")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(5),
      supabase
        .from("blog_posts")
        .select("id, title, slug, view_count")
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .limit(3),
      supabase
        .from("community_announcements")
        .select("id, title, body, created_at, is_pinned, profiles(full_name, avatar_url)")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(12),
      supabase.from("community_topics").select("slug, label").order("sort_order", { ascending: true }),
      user ? supabase.from("community_members").select("id").eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
      user ? supabase.from("profiles").select("role").eq("id", user.id).maybeSingle() : Promise.resolve({ data: null }),
    ])

    for (const id of postIds) commentCounts[id] = 0
    for (const c of commentsRes.data ?? []) {
      commentCounts[c.post_id] = (commentCounts[c.post_id] ?? 0) + 1
    }

    if (eventsRes.data) events = eventsRes.data
    if (featuredRes.data) featuredBlogs = featuredRes.data
    if (announcementsRes.data) announcements = announcementsRes.data as AnnouncementRow[]
    if (topicsRes.data) topics = topicsRes.data
    if (memberRes.data) isMember = true
    role = (profileRes.data as { role?: string } | null)?.role
    if (role && ["admin", "platform_admin", "mt"].includes(role)) canAddTopic = true
  } catch {
    // tables may not exist yet
  }

  if (topics.length === 0) {
    topics = [
      { slug: "duyurular", label: "Duyurular" },
      { slug: "frontend", label: "Frontend" },
      { slug: "backend", label: "Backend" },
      { slug: "kariyer", label: "Kariyer" },
      { slug: "open-source", label: "Open Source" },
    ]
  }

  const announcementPosts: FeedPost[] = announcements.map((a) => {
    const plain = a.body ? String(a.body).replace(/<[^>]*>/g, "").trim() : ""
    const excerpt = plain ? plain.slice(0, 160) + (plain.length > 160 ? "…" : "") : undefined
    const profile = Array.isArray(a.profiles) ? a.profiles[0] ?? null : a.profiles ?? null

    return {
      id: a.id,
      title: a.title,
      slug: undefined,
      excerpt,
      cover_image_url: null,
      published_at: a.created_at,
      created_at: a.created_at,
      view_count: 0,
      like_count: 0,
      author: profile,
      isPinned: a.is_pinned ?? false,
      type: "announcement",
    }
  })

  const feedPosts: FeedPost[] = [...announcementPosts, ...feedPostsFromBlog].sort(
    (a, b) => new Date(b.published_at ?? b.created_at).getTime() - new Date(a.published_at ?? a.created_at).getTime()
  )

  const aggregatedNews = await newsPromise

  return (
    <div className="min-h-screen bg-background">
      <CommunityHero />

      <div className="container mx-auto px-4 py-6 pt-8 md:py-8 md:pt-10">
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
          <CommunitySidebar topics={topics} isMember={isMember} canAddTopic={canAddTopic} userId={user?.id ?? null} userRole={role ?? null} />
          <CommunityFeeds
            posts={feedPosts}
            commentCounts={commentCounts}
            aggregatedNews={aggregatedNews}
            isLoggedIn={!!user}
            userRole={role ?? null}
          />
          <CommunityRightSidebar events={events} featuredBlogs={featuredBlogs} />
        </div>

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
                  <Link href="#feed">Yazıları oku</Link>
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
