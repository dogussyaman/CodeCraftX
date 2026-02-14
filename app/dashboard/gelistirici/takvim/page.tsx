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
        companies:company_id ( name )
      ),
      interviews (
        id,
        meet_link,
        proposed_date,
        proposed_time_slots,
        developer_selected_slot,
        scheduled_at
      )
    `
    )
    .eq("developer_id", user.id)

  const events: CalendarEvent[] = []

  for (const app of applications ?? []) {
    const job = app.job_postings as { title?: string; companies?: { name?: string } } | null
    const companyName = job?.companies?.name ?? "Şirket"
    const title = job?.title ?? "Görüşme"
    const interviews = (app.interviews ?? []) as {
      id: string
      meet_link?: string | null
      proposed_date?: string | null
      proposed_time_slots?: string[] | null
      developer_selected_slot?: string | null
      scheduled_at?: string
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

      events.push({
        date: dateStr,
        time: typeof timeStr === "string" ? timeStr : "—",
        title,
        companyName,
        meetLink: int.meet_link ?? null,
        applicationId: app.id,
        interviewId: int.id,
      })
    }
  }

  return (
    <TakvimView
      events={events}
      title="Takvim"
      subtitle="Görüşme takviminiz"
      emptyMessage="Bu tarihte görüşme yok"
    />
  )
}
