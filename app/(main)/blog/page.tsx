import type { Metadata } from "next"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { createServerClient } from "@/lib/supabase/server"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { BlogListSearch } from "./_components/BlogListSearch"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Blog"),
  description: "Kariyer ipuçları, teknoloji yazıları ve topluluk deneyimleri. Codecrafters blog.",
  path: "/blog",
})

export default async function BlogPage() {
  const supabase = await createServerClient()
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, body, cover_image_url, published_at, created_at, profiles(full_name, avatar_url)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-background">
      <AuroraBackground className="min-h-[42vh] pt-24 pb-16 md:pt-28 md:pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <header className="mb-12 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Blog
            </h1>
            <p className="text-lg text-muted-foreground">
              Kariyer ipuçları, teknoloji yazıları ve topluluk deneyimleri.
            </p>
          </header>
        </div>
      </AuroraBackground>

      <div className="container mx-auto px-4 max-w-6xl -mt-4 pb-24">
        <BlogListSearch initialPosts={posts ?? []} />
      </div>
    </div>
  )
}
