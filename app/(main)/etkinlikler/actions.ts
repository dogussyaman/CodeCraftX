"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type RegisterEventState = { ok: boolean; error?: string }

/**
 * Etkinliğe kayıt. Sadece topluluk üyesi ve developer/admin/platform_admin rolü kayıt olabilir.
 * Kontenjan ve son kayıt tarihi kontrol edilir.
 */
export async function registerForEvent(eventId: string): Promise<RegisterEventState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Giriş yapmanız gerekiyor" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const role = (profile as { role?: string } | null)?.role
  const allowedRoles = ["developer", "admin", "platform_admin"]
  if (!role || !allowedRoles.includes(role)) {
    return { ok: false, error: "Sadece geliştirici veya yönetici hesapları etkinliğe kayıt olabilir" }
  }

  const { data: member } = await supabase.from("community_members").select("id").eq("user_id", user.id).maybeSingle()
  if (!member) return { ok: false, error: "Etkinliğe kayıt olmak için topluluk üyesi olmanız gerekiyor" }

  const { data: event } = await supabase
    .from("platform_events")
    .select("id, status, max_participants, registration_deadline")
    .eq("id", eventId)
    .single()

  if (!event) return { ok: false, error: "Etkinlik bulunamadı" }
  if ((event as { status: string }).status !== "published") {
    return { ok: false, error: "Bu etkinlik kayıt için açık değil" }
  }

  const maxParticipants = (event as { max_participants?: number | null }).max_participants
  if (maxParticipants != null) {
    const { count } = await supabase
      .from("platform_event_registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
    if (count != null && count >= maxParticipants) {
      return { ok: false, error: "Kontenjan dolmuş" }
    }
  }

  const deadline = (event as { registration_deadline?: string | null }).registration_deadline
  if (deadline && new Date(deadline) < new Date()) {
    return { ok: false, error: "Kayıt süresi dolmuş" }
  }

  const { error } = await supabase.from("platform_event_registrations").insert({
    event_id: eventId,
    user_id: user.id,
  })

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Bu etkinliğe zaten kayıtlısınız" }
    console.error("Event registration error:", error)
    return { ok: false, error: "Kayıt yapılamadı" }
  }

  revalidatePath("/etkinlikler")
  revalidatePath("/dashboard/gelistirici/takvim")
  revalidatePath("/dashboard/gelistirici/etkinlikler")
  return { ok: true }
}

export async function unregisterFromEvent(eventId: string): Promise<RegisterEventState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Giriş yapmanız gerekiyor" }

  const { error } = await supabase
    .from("platform_event_registrations")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Event unregister error:", error)
    return { ok: false, error: "Kayıt iptal edilemedi" }
  }

  revalidatePath("/etkinlikler")
  revalidatePath("/dashboard/gelistirici/takvim")
  revalidatePath("/dashboard/gelistirici/etkinlikler")
  return { ok: true }
}
