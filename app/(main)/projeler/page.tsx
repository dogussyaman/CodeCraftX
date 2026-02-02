import type { Metadata } from "next"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { createServerClient } from "@/lib/supabase/server"
import { ProjectsHero } from "./_components/ProjectsHero"
import { ProjectsGrid } from "./_components/ProjectsGrid"
import { ProjectsSubmitCta } from "./_components/ProjectsSubmitCta"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Projeler"),
  description: "Topluluk projeleri. Açık kaynak ve ortak projelere katılın.",
  path: "/projeler",
})

export default async function ProjelerPage() {
  const supabase = await createServerClient()

  const { data: projeler } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("stars", { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-background">
      <ProjectsHero />
      <ProjectsGrid projeler={projeler} />
      <ProjectsSubmitCta />
    </div>
  )
}
