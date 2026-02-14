"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleProjectLike(projectId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "Beğenmek için giriş yapmalısınız" }
  }

  const { data: existing } = await supabase
    .from("project_likes")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("project_likes")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", user.id)
    if (error) {
      console.error("Project like delete error:", error)
      return { ok: false, error: "Beğeni kaldırılamadı" }
    }
  } else {
    const { error } = await supabase.from("project_likes").insert({
      project_id: projectId,
      user_id: user.id,
    })
    if (error) {
      console.error("Project like insert error:", error)
      return { ok: false, error: "Beğeni eklenemedi" }
    }
  }

  revalidatePath(`/projeler/${projectId}`)
  revalidatePath("/projeler")
  return { ok: true }
}

export async function createProjectJoinRequest(projectId: string, message: string | null) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Katılmak için giriş yapmalısınız" }

  const { data: project } = await supabase
    .from("projects")
    .select("id, created_by, title")
    .eq("id", projectId)
    .eq("status", "published")
    .single()
  if (!project) return { ok: false, error: "Proje bulunamadı" }
  if (project.created_by === user.id) return { ok: false, error: "Kendi projenize katılma isteği gönderemezsiniz" }

  const { error: insertError } = await supabase.from("project_join_requests").insert({
    project_id: projectId,
    user_id: user.id,
    message: message?.trim() || null,
    status: "pending",
  })
  if (insertError) {
    if (insertError.code === "23505") return { ok: false, error: "Zaten katılma isteği gönderdiniz" }
    console.error("Project join request insert error:", insertError)
    return { ok: false, error: "İstek gönderilemedi" }
  }

  const { error: notifError } = await supabase.from("notifications").insert({
    recipient_id: project.created_by,
    actor_id: user.id,
    type: "system",
    title: "Yeni proje katılma isteği",
    body: `"${project.title}" projesine katılmak isteyen bir geliştirici var.`,
    href: "/dashboard/gelistirici/projelerim",
    data: { project_id: projectId },
  })
  if (notifError) console.error("Notification insert error:", notifError)

  revalidatePath(`/projeler/${projectId}`)
  revalidatePath("/dashboard/gelistirici/projelerim")
  return { ok: true }
}
