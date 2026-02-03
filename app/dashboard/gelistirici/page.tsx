import { createClient } from "@/lib/supabase/server"
import { DeveloperHeader } from "./_components/DeveloperHeader"
import { DeveloperStats } from "./_components/DeveloperStats"
import { DeveloperRecentMatches } from "./_components/DeveloperRecentMatches"
import { DeveloperRecentPosts } from "./_components/DeveloperRecentPosts"
import { DeveloperSidebar } from "./_components/DeveloperSidebar"

export default async function DeveloperDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Profil bilgisini al
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

  // CV sayısını al
  const { count: cvCount } = await supabase
    .from("cvs")
    .select("*", { count: "exact", head: true })
    .eq("developer_id", user.id)

  // Eşleşme sayısını al
  const { count: matchCount } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true })
    .eq("developer_id", user.id)

  // Başvuru sayısını al
  const { count: applicationCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("developer_id", user.id)

  // Son eşleşmeleri al
  const { data: recentMatches } = await supabase
    .from("matches")
    .select(
      `
      *,
      job_postings:job_id (
        title,
        location,
        job_type,
        companies:company_id (
          name,
          logo_url
        )
      )
    `,
    )
    .eq("developer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Son blog yazılarını al
  const { data: recentPosts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, status, published_at, created_at, cover_image_url")
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(5)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen animate-in fade-in duration-500">
      <DeveloperHeader fullName={profile?.full_name ?? null} />
      <DeveloperStats cvCount={cvCount ?? 0} matchCount={matchCount ?? 0} applicationCount={applicationCount ?? 0} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <DeveloperRecentMatches cvCount={cvCount ?? 0} recentMatches={recentMatches ?? null} />
        <DeveloperRecentPosts recentPosts={recentPosts ?? null} />
        <DeveloperSidebar />
      </div>
    </div>
  )
}
