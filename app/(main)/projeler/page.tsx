import type { Metadata } from "next"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { createServerClient } from "@/lib/supabase/server"
import { ProjectsHero } from "./_components/ProjectsHero"
import { ProjectsGrid } from "./_components/ProjectsGrid"
import { ProjectsHowToJoin } from "./_components/ProjectsHowToJoin"
import { ProjectsSubmitCta } from "./_components/ProjectsSubmitCta"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Projeler"),
  description: "Topluluk projeleri. Açık kaynak ve ortak projelere katılın.",
  path: "/projeler",
})

function getProjeYeniHref(role: string | null): string {
  if (role === "admin") return "/dashboard/admin/projeler/yeni"
  return "/dashboard/gelistirici/projelerim/yeni"
}

export default async function ProjelerPage() {
  const supabase = await createServerClient()

  const [
    { data: projeler },
    { data: { user } },
  ] = await Promise.all([
    supabase.from("projects").select("*").eq("status", "published").order("stars", { ascending: false }).limit(20),
    supabase.auth.getUser(),
  ])

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null }
  const projeYeniHref = getProjeYeniHref(profile?.role as string | null)

  return (
    <div className="min-h-screen bg-background">
      <ProjectsHero />
      <ProjectsGrid projeler={projeler} />
      <section className="container mx-auto px-4 py-12 max-w-7xl">
        <h2 className="text-xl font-semibold mb-4">Projeye Katılım Rehberi</h2>
        <ProjectsHowToJoin />
      </section>
      <ProjectsSubmitCta projectSubmitHref={projeYeniHref} />
    </div>
  )
}
