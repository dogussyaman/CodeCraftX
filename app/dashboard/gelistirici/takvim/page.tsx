import { createClient } from "@/lib/supabase/server"
import { TakvimView } from "@/components/takvim-view"
import type { CalendarEvent } from "@/lib/calendar-types"

export default async function GelistiriciTakvimPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: applications } = await supabase
    .from("applications")
    .select(
      `
      id,
      job_postings:job_id (
        title,
        location,
        companies:company_id ( name )
      ),
      interviews (
        id,
        meet_link,
        proposed_date,
        proposed_time_slots,
        developer_selected_slot,
        scheduled_at,
        invited_attendee_ids
      )
    `
    )
    .eq("developer_id", user.id)

  const allAttendeeIds = new Set<string>()
  for (const app of applications ?? []) {
    const interviews = (app.interviews ?? []) as { invited_attendee_ids?: string[] | null }[]
    for (const int of interviews) {
      const ids = int.invited_attendee_ids
      if (Array.isArray(ids)) for (const id of ids) allAttendeeIds.add(id)
    }
  }
  const attendeeIdsList = Array.from(allAttendeeIds)
  const { data: attendeeProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", attendeeIdsList.length > 0 ? attendeeIdsList : [""])
  const attendeeMap = new Map<string, { id: string; full_name: string; email?: string | null }>()
  for (const p of attendeeProfiles ?? []) {
    const r = p as { id: string; full_name: string; email?: string | null }
    attendeeMap.set(r.id, { id: r.id, full_name: r.full_name, email: r.email ?? null })
  }

  const events: CalendarEvent[] = []

  for (const app of applications ?? []) {
    const job = app.job_postings as { title?: string; location?: string; companies?: { name?: string } } | null
    const companyName = job?.companies?.name ?? "Şirket"
    const title = job?.title ?? "Görüşme"
    const jobLocation = job?.location ?? null
    const interviews = (app.interviews ?? []) as {
      id: string
      meet_link?: string | null
      proposed_date?: string | null
      proposed_time_slots?: string[] | null
      developer_selected_slot?: string | null
      scheduled_at?: string
      invited_attendee_ids?: string[] | null
    }[]

    for (const int of interviews) {
      const dateStr =
        int.proposed_date ??
        (int.scheduled_at ? int.scheduled_at.slice(0, 10) : null)
      if (!dateStr) continue

      const timeStr =
        int.developer_selected_slot ??
        (Array.isArray(int.proposed_time_slots) && int.proposed_time_slots.length > 0
          ? int.proposed_time_slots[0]
          : null) ??
        (int.scheduled_at
          ? new Date(int.scheduled_at).toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "—")

      const attendeeIds = int.invited_attendee_ids ?? []
      const attendees = Array.isArray(attendeeIds)
        ? attendeeIds
            .map((id) => attendeeMap.get(id))
            .filter(Boolean) as { id: string; full_name: string; email?: string | null }[]
        : []

      events.push({
        date: dateStr,
        time: typeof timeStr === "string" ? timeStr : "—",
        title,
        companyName,
        meetLink: int.meet_link ?? null,
        applicationId: app.id,
        interviewId: int.id,
        jobLocation,
        attendees,
        eventType: "interview",
      })
    }
  }

  const { data: registrations } = await supabase
    .from("platform_event_registrations")
    .select("event_id, platform_events(id, title, start_date, end_date, online_link, organizer_name)")
    .eq("user_id", user.id)

  for (const reg of registrations ?? []) {
    const ev = (reg as { platform_events: unknown }).platform_events
    if (!ev || typeof ev !== "object") continue
    const e = ev as { id: string; title?: string; start_date?: string; end_date?: string | null; online_link?: string | null; organizer_name?: string | null }
    const startDate = e.start_date
    if (!startDate) continue
    const d = new Date(startDate)
    const dateStr = d.toISOString().slice(0, 10)
    const timeStr = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", hour12: false })
    events.push({
      date: dateStr,
      time: timeStr,
      title: e.title ?? "Etkinlik",
      companyName: e.organizer_name ?? "Etkinlik",
      meetLink: e.online_link ?? null,
      eventId: e.id,
      eventType: "platform_event",
    })
  }

  events.sort((a, b) => {
    const d = a.date.localeCompare(b.date)
    if (d !== 0) return d
    return (a.time || "").localeCompare(b.time || "")
  })

  return (
    <TakvimView
      events={events}
      title="Takvim"
      subtitle="Görüşme takviminiz"
      emptyMessage="Bu tarihte görüşme yok"
    />
  )
}
