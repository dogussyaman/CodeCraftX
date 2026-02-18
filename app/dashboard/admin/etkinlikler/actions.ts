"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const eventTypeEnum = z.enum(["hackathon", "seminer", "workshop", "konferans", "webinar"])
const statusEnum = z.enum(["draft", "published", "cancelled"])
const attendanceTypeEnum = z.enum(["free", "paid"])

const locationSchema = z
  .object({
    city: z.string().optional(),
    address: z.string().optional(),
    venue: z.string().optional(),
    map_link: z.string().url().optional().or(z.literal("")),
  })
  .optional()
  .nullable()

const speakerSchema = z.object({
  full_name: z.string().min(1),
  title: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal("")),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  github_url: z.string().url().optional().or(z.literal("")),
  talk_title: z.string().optional(),
  sort_order: z.number().optional(),
})

const eventSchema = z.object({
  title: z.string().min(2, "Başlık en az 2 karakter olmalıdır"),
  type: eventTypeEnum,
  short_description: z.string().optional(),
  description: z.string().optional(),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  tags: z.preprocess(
    (v) => (typeof v === "string" ? (v.trim() ? v.split(",").map((s) => s.trim()).filter(Boolean) : []) : v),
    z.array(z.string()).optional()
  ),
  start_date: z.string().min(1, "Başlangıç tarihi gerekli"),
  end_date: z.string().optional(),
  timezone: z.string().optional(),
  duration_hours: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().positive().nullable().optional()),
  is_online: z.preprocess((v) => v === "true" || v === true, z.boolean()),
  location: z.preprocess((v) => {
    if (typeof v !== "string" || !v.trim()) return null
    try {
      return JSON.parse(v) as unknown
    } catch {
      return null
    }
  }, locationSchema),
  online_link: z.string().url().optional().or(z.literal("")),
  online_platform: z.string().optional(),
  organizer_name: z.string().optional(),
  organizer_logo_url: z.string().url().optional().or(z.literal("")),
  organizer_website: z.string().url().optional().or(z.literal("")),
  contact_email: z.string().email().optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  attendance_type: attendanceTypeEnum.default("free"),
  price: z.preprocess((v) => (v === "" || v == null ? 0 : Number(v)), z.number().min(0)),
  max_participants: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().positive().nullable().optional()),
  registration_required: z.preprocess((v) => v === "true" || v === true, z.boolean()),
  registration_deadline: z.string().optional(),
  is_team_event: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  min_team_size: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().min(0).nullable().optional()),
  max_team_size: z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().int().positive().nullable().optional()),
  prizes: z.preprocess((v) => {
    if (typeof v !== "string" || !v.trim()) return []
    try {
      return JSON.parse(v) as unknown
    } catch {
      return []
    }
  }, z.array(z.unknown()).optional()),
  theme_description: z.string().optional(),
  jury: z.preprocess((v) => {
    if (typeof v !== "string" || !v.trim()) return []
    try {
      return JSON.parse(v) as unknown
    } catch {
      return []
    }
  }, z.array(z.unknown()).optional()),
  mentors: z.preprocess((v) => {
    if (typeof v !== "string" || !v.trim()) return []
    try {
      return JSON.parse(v) as unknown
    } catch {
      return []
    }
  }, z.array(z.unknown()).optional()),
  technologies: z.preprocess(
    (v) => (typeof v === "string" ? (v.trim() ? v.split(",").map((s) => s.trim()).filter(Boolean) : []) : v),
    z.array(z.string()).optional()
  ),
  status: statusEnum.default("draft"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug: sadece küçük harf, rakam ve tire"),
  featured: z.preprocess((v) => v === "true" || v === true, z.boolean()),
  speakers: z.preprocess((v) => {
    if (typeof v !== "string" || !v.trim()) return []
    try {
      return JSON.parse(v) as unknown
    } catch {
      return []
    }
  }, z.array(speakerSchema).optional()),
})

export type EventFormState = { ok: boolean; error?: string }

function getFormStr(formData: FormData, key: string): string {
  return (formData.get(key) as string)?.trim() ?? ""
}

/** datetime-local "YYYY-MM-DDTHH:mm" -> ISO string for DB */
function toIsoDateTime(s: string | undefined): string | null {
  if (!s?.trim()) return null
  try {
    const d = new Date(s)
    return isNaN(d.getTime()) ? null : d.toISOString()
  } catch {
    return null
  }
}

async function ensureAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).single()
  const role = (data as { role?: string } | null)?.role
  return role === "admin" || role === "platform_admin" || role === "mt"
}

export async function createEvent(prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Oturum açmanız gerekiyor" }
  const isAdmin = await ensureAdmin(supabase, user.id)
  if (!isAdmin) return { ok: false, error: "Yetkiniz yok" }

  const slugRaw = getFormStr(formData, "slug").toLowerCase().replace(/\s+/g, "-") || getFormStr(formData, "title").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "-")
  const raw = {
    title: getFormStr(formData, "title"),
    type: formData.get("type") || "seminer",
    short_description: getFormStr(formData, "short_description") || undefined,
    description: getFormStr(formData, "description") || undefined,
    cover_image_url: getFormStr(formData, "cover_image_url") || undefined,
    tags: getFormStr(formData, "tags"),
    start_date: getFormStr(formData, "start_date"),
    end_date: getFormStr(formData, "end_date") || undefined,
    timezone: getFormStr(formData, "timezone") || "Europe/Istanbul",
    duration_hours: getFormStr(formData, "duration_hours") || undefined,
    is_online: formData.get("is_online") === "true",
    location: getFormStr(formData, "location") || undefined,
    online_link: getFormStr(formData, "online_link") || undefined,
    online_platform: getFormStr(formData, "online_platform") || undefined,
    organizer_name: getFormStr(formData, "organizer_name") || undefined,
    organizer_logo_url: getFormStr(formData, "organizer_logo_url") || undefined,
    organizer_website: getFormStr(formData, "organizer_website") || undefined,
    contact_email: getFormStr(formData, "contact_email") || undefined,
    contact_phone: getFormStr(formData, "contact_phone") || undefined,
    attendance_type: formData.get("attendance_type") || "free",
    price: getFormStr(formData, "price") || "0",
    max_participants: getFormStr(formData, "max_participants") || undefined,
    registration_required: formData.get("registration_required") === "true",
    registration_deadline: getFormStr(formData, "registration_deadline") || undefined,
    is_team_event: formData.get("is_team_event") === "true",
    min_team_size: getFormStr(formData, "min_team_size") || undefined,
    max_team_size: getFormStr(formData, "max_team_size") || undefined,
    prizes: getFormStr(formData, "prizes") || undefined,
    theme_description: getFormStr(formData, "theme_description") || undefined,
    jury: getFormStr(formData, "jury") || undefined,
    mentors: getFormStr(formData, "mentors") || undefined,
    technologies: getFormStr(formData, "technologies") || undefined,
    status: formData.get("status") || "draft",
    slug: slugRaw,
    featured: formData.get("featured") === "true",
    speakers: getFormStr(formData, "speakers") || undefined,
  }
  const parsed = eventSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? "Veri doğrulama hatası"
    return { ok: false, error: msg }
  }

  const d = parsed.data
  const locationObj =
    d.location && (d.location.city || d.location.address || d.location.venue || d.location.map_link)
      ? d.location
      : null
  const startIso = toIsoDateTime(d.start_date) ?? d.start_date
  const endIso = d.end_date ? toIsoDateTime(d.end_date) ?? d.end_date : null
  const deadlineIso = d.registration_deadline ? toIsoDateTime(d.registration_deadline) ?? d.registration_deadline : null

  const { data: inserted, error } = await supabase
    .from("platform_events")
    .insert({
      title: d.title,
      type: d.type,
      short_description: d.short_description || null,
      description: d.description || null,
      cover_image_url: d.cover_image_url || null,
      tags: d.tags ?? [],
      start_date: startIso,
      end_date: endIso,
      timezone: d.timezone || "Europe/Istanbul",
      duration_hours: d.duration_hours ?? null,
      is_online: d.is_online,
      location: locationObj ?? {},
      online_link: d.online_link || null,
      online_platform: d.online_platform || null,
      organizer_name: d.organizer_name || null,
      organizer_logo_url: d.organizer_logo_url || null,
      organizer_website: d.organizer_website || null,
      contact_email: d.contact_email || null,
      contact_phone: d.contact_phone || null,
      attendance_type: d.attendance_type,
      price: d.price ?? 0,
      max_participants: d.max_participants ?? null,
      registration_required: d.registration_required,
      registration_deadline: deadlineIso,
      is_team_event: d.is_team_event ?? false,
      min_team_size: d.min_team_size ?? null,
      max_team_size: d.max_team_size ?? null,
      prizes: Array.isArray(d.prizes) ? d.prizes : [],
      theme_description: d.theme_description || null,
      jury: Array.isArray(d.jury) ? d.jury : [],
      mentors: Array.isArray(d.mentors) ? d.mentors : [],
      technologies: d.technologies ?? [],
      status: d.status,
      slug: d.slug,
      featured: d.featured,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Bu slug zaten kullanılıyor" }
    console.error("Event create error:", error)
    return { ok: false, error: "Etkinlik eklenemedi" }
  }

  if (inserted?.id && d.speakers?.length) {
    for (let i = 0; i < d.speakers.length; i++) {
      const s = d.speakers[i]
      await supabase.from("platform_event_speakers").insert({
        event_id: inserted.id,
        full_name: s.full_name,
        title: s.title || null,
        photo_url: s.photo_url || null,
        linkedin_url: s.linkedin_url || null,
        github_url: s.github_url || null,
        talk_title: s.talk_title || null,
        sort_order: s.sort_order ?? i,
      })
    }
  }

  revalidatePath("/dashboard/admin/etkinlikler")
  revalidatePath("/etkinlikler")
  revalidatePath("/community")
  return { ok: true }
}

export async function updateEvent(eventId: string, prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Oturum açmanız gerekiyor" }
  const isAdmin = await ensureAdmin(supabase, user.id)
  if (!isAdmin) return { ok: false, error: "Yetkiniz yok" }

  const slugRaw = getFormStr(formData, "slug").toLowerCase().replace(/\s+/g, "-")
  const raw = {
    title: getFormStr(formData, "title"),
    type: formData.get("type") || "seminer",
    short_description: getFormStr(formData, "short_description") || undefined,
    description: getFormStr(formData, "description") || undefined,
    cover_image_url: getFormStr(formData, "cover_image_url") || undefined,
    tags: getFormStr(formData, "tags"),
    start_date: getFormStr(formData, "start_date"),
    end_date: getFormStr(formData, "end_date") || undefined,
    timezone: getFormStr(formData, "timezone") || "Europe/Istanbul",
    duration_hours: getFormStr(formData, "duration_hours") || undefined,
    is_online: formData.get("is_online") === "true",
    location: getFormStr(formData, "location") || undefined,
    online_link: getFormStr(formData, "online_link") || undefined,
    online_platform: getFormStr(formData, "online_platform") || undefined,
    organizer_name: getFormStr(formData, "organizer_name") || undefined,
    organizer_logo_url: getFormStr(formData, "organizer_logo_url") || undefined,
    organizer_website: getFormStr(formData, "organizer_website") || undefined,
    contact_email: getFormStr(formData, "contact_email") || undefined,
    contact_phone: getFormStr(formData, "contact_phone") || undefined,
    attendance_type: formData.get("attendance_type") || "free",
    price: getFormStr(formData, "price") || "0",
    max_participants: getFormStr(formData, "max_participants") || undefined,
    registration_required: formData.get("registration_required") === "true",
    registration_deadline: getFormStr(formData, "registration_deadline") || undefined,
    is_team_event: formData.get("is_team_event") === "true",
    min_team_size: getFormStr(formData, "min_team_size") || undefined,
    max_team_size: getFormStr(formData, "max_team_size") || undefined,
    prizes: getFormStr(formData, "prizes") || undefined,
    theme_description: getFormStr(formData, "theme_description") || undefined,
    jury: getFormStr(formData, "jury") || undefined,
    mentors: getFormStr(formData, "mentors") || undefined,
    technologies: getFormStr(formData, "technologies") || undefined,
    status: formData.get("status") || "draft",
    slug: slugRaw,
    featured: formData.get("featured") === "true",
    speakers: getFormStr(formData, "speakers") || undefined,
  }
  const parsed = eventSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? "Veri doğrulama hatası"
    return { ok: false, error: msg }
  }

  const d = parsed.data
  const locationObj =
    d.location && (d.location.city || d.location.address || d.location.venue || d.location.map_link)
      ? d.location
      : null

  const startIso = toIsoDateTime(d.start_date) ?? d.start_date
  const endIso = d.end_date ? toIsoDateTime(d.end_date) ?? d.end_date : null
  const deadlineIso = d.registration_deadline ? toIsoDateTime(d.registration_deadline) ?? d.registration_deadline : null

  const { error } = await supabase
    .from("platform_events")
    .update({
      title: d.title,
      type: d.type,
      short_description: d.short_description || null,
      description: d.description || null,
      cover_image_url: d.cover_image_url || null,
      tags: d.tags ?? [],
      start_date: startIso,
      end_date: endIso,
      timezone: d.timezone || "Europe/Istanbul",
      duration_hours: d.duration_hours ?? null,
      is_online: d.is_online,
      location: locationObj ?? {},
      online_link: d.online_link || null,
      online_platform: d.online_platform || null,
      organizer_name: d.organizer_name || null,
      organizer_logo_url: d.organizer_logo_url || null,
      organizer_website: d.organizer_website || null,
      contact_email: d.contact_email || null,
      contact_phone: d.contact_phone || null,
      attendance_type: d.attendance_type,
      price: d.price ?? 0,
      max_participants: d.max_participants ?? null,
      registration_required: d.registration_required,
      registration_deadline: deadlineIso,
      is_team_event: d.is_team_event ?? false,
      min_team_size: d.min_team_size ?? null,
      max_team_size: d.max_team_size ?? null,
      prizes: Array.isArray(d.prizes) ? d.prizes : [],
      theme_description: d.theme_description || null,
      jury: Array.isArray(d.jury) ? d.jury : [],
      mentors: Array.isArray(d.mentors) ? d.mentors : [],
      technologies: d.technologies ?? [],
      status: d.status,
      slug: d.slug,
      featured: d.featured,
    })
    .eq("id", eventId)

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Bu slug zaten kullanılıyor" }
    console.error("Event update error:", error)
    return { ok: false, error: "Etkinlik güncellenemedi" }
  }

  await supabase.from("platform_event_speakers").delete().eq("event_id", eventId)
  if (d.speakers?.length) {
    for (let i = 0; i < d.speakers.length; i++) {
      const s = d.speakers[i]
      await supabase.from("platform_event_speakers").insert({
        event_id: eventId,
        full_name: s.full_name,
        title: s.title || null,
        photo_url: s.photo_url || null,
        linkedin_url: s.linkedin_url || null,
        github_url: s.github_url || null,
        talk_title: s.talk_title || null,
        sort_order: s.sort_order ?? i,
      })
    }
  }

  revalidatePath("/dashboard/admin/etkinlikler")
  revalidatePath(`/dashboard/admin/etkinlikler/${eventId}/duzenle`)
  revalidatePath("/etkinlikler")
  revalidatePath(`/etkinlikler/${d.slug}`)
  revalidatePath("/community")
  return { ok: true }
}

export async function deleteEvent(eventId: string): Promise<EventFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Oturum açmanız gerekiyor" }
  const isAdmin = await ensureAdmin(supabase, user.id)
  if (!isAdmin) return { ok: false, error: "Yetkiniz yok" }

  const { error } = await supabase.from("platform_events").delete().eq("id", eventId)
  if (error) {
    console.error("Event delete error:", error)
    return { ok: false, error: "Etkinlik silinemedi" }
  }
  revalidatePath("/dashboard/admin/etkinlikler")
  revalidatePath("/etkinlikler")
  revalidatePath("/community")
  return { ok: true }
}
