import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { ProjectForm } from "@/app/dashboard/gelistirici/projelerim/_components/ProjectForm"

export default async function AdminProjeDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: proje } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("created_by", user.id)
    .single()

  if (!proje) notFound()

  const technologies = Array.isArray(proje.technologies)
    ? proje.technologies
    : typeof proje.technologies === "string"
      ? JSON.parse(proje.technologies || "[]")
      : []

  return (
    <div className="space-y-6">
      <ProjectForm
        mode="edit"
        projectId={proje.id}
        listPath="/dashboard/admin/projeler"
        initialValues={{
          title: proje.title,
          description: proje.description,
          long_description: proje.long_description ?? undefined,
          technologies,
          github_url: proje.github_url ?? undefined,
          demo_url: proje.demo_url ?? undefined,
          image_url: proje.image_url ?? undefined,
          category: proje.category ?? undefined,
          inspired_by: proje.inspired_by ?? undefined,
          status: proje.status ?? "draft",
        }}
      />
    </div>
  )
}
