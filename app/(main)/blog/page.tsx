import type { Metadata } from "next"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { createServerClient } from "@/lib/supabase/server"
import { BlogHero } from "./_components/BlogHero"
import { BlogCTA } from "./_components/BlogCTA"
import { BlogFeaturedSection } from "./_components/BlogFeaturedSection"
import { BlogListSearch } from "./_components/BlogListSearch"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Blog"),
  description: "Kariyer ipuçları, teknoloji yazıları ve topluluk deneyimleri. CodeCraftX blog.",
  path: "/blog",
})

const MAX_POSTS = 100

export default async function BlogPage() {
  const supabase = await createServerClient()
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, body, cover_image_url, published_at, created_at, view_count, like_count, profiles(full_name, avatar_url)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(MAX_POSTS)

  const allPosts = posts ?? []
  const postIds = allPosts.map((p) => p.id)
  const commentCounts: Record<string, number> = {}
  if (postIds.length > 0) {
    const { data: comments } = await supabase
      .from("blog_comments")
      .select("post_id")
      .in("post_id", postIds)
    for (const id of postIds) commentCounts[id] = 0
    for (const c of comments ?? []) commentCounts[c.post_id] = (commentCounts[c.post_id] ?? 0) + 1
  }

  const featured = allPosts.slice(0, 2)
  const restPosts = allPosts.slice(2)

  return (
    <div className="min-h-screen bg-background">
      <BlogHero />

      <div className="container mx-auto px-4 max-w-6xl pt-10 pb-24">
        {featured.length > 0 && (
          <BlogFeaturedSection posts={featured} commentCounts={commentCounts} />
        )}
        <BlogListSearch initialPosts={restPosts} commentCounts={commentCounts} />
      </div>

      <BlogCTA />
    </div>
  )
}
