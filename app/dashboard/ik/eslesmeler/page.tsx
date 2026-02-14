import { createClient } from "@/lib/supabase/server"
import { MatchesWithFilters } from "./_components/MatchesWithFilters"
import { Star } from "lucide-react"

export default async function HRMatchesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user!.id)
    .single()

  // Şirketin ilanlarını al
  const { data: myJobs } = await supabase
    .from("job_postings")
    .select("id, title")
    .eq("company_id", profile?.company_id ?? "")

  const jobIds = myJobs?.map((job) => job.id) || []

  // Bu ilanlara ait eşleşmeleri al
  const { data: matchesRaw } = await supabase
    .from("matches")
    .select(
      `
      *,
      job_postings:job_id (
        title,
        location
      ),
      profiles:developer_id (
        full_name,
        email,
        phone
      )
    `,
    )
    .in("job_id", jobIds.length > 0 ? jobIds : [""])
    .order("match_score", { ascending: false })

  const matchesList = matchesRaw ?? []

  // Görüşme yapılacak (hired) eşleşmeler için application_id ve interview bilgisi
  let matchesWithInterviews: Array<Record<string, unknown> & { interview?: { id: string; date: string; time: string; meetLink: string | null } }> = matchesList

  if (matchesList.length > 0 && jobIds.length > 0) {
    const { data: applications } = await supabase
      .from("applications")
      .select("id, job_id, developer_id")
      .in("job_id", jobIds)

    const key = (j: string, d: string) => `${j}|${d}`
    const appByKey = new Map<string, string>()
    for (const a of applications ?? []) {
      const row = a as { id: string; job_id: string; developer_id: string }
      appByKey.set(key(row.job_id, row.developer_id), row.id)
    }

    const applicationIds = Array.from(appByKey.values())
    const { data: interviews } = await supabase
      .from("interviews")
      .select("id, application_id, proposed_date, developer_selected_slot, meet_link, proposed_time_slots, scheduled_at")
      .in("application_id", applicationIds.length > 0 ? applicationIds : [""])
      .in("status", ["scheduled", "rescheduled"])

    const interviewByAppId = new Map<string, (typeof interviews)[number]>()
    for (const i of interviews ?? []) {
      const row = i as { application_id: string }
      interviewByAppId.set(row.application_id, i)
    }

    matchesWithInterviews = matchesList.map((m) => {
      const row = m as { job_id?: string; developer_id?: string; status?: string }
      const appId = row.job_id && row.developer_id ? appByKey.get(key(row.job_id, row.developer_id)) : null
      const int = appId ? interviewByAppId.get(appId) : null
      const interviewRow = int as {
        id: string
        proposed_date?: string | null
        developer_selected_slot?: string | null
        meet_link?: string | null
        proposed_time_slots?: string[] | null
        scheduled_at?: string
      } | undefined
      if (!interviewRow) return { ...m }
      const dateStr = interviewRow.proposed_date ?? (interviewRow.scheduled_at ? interviewRow.scheduled_at.slice(0, 10) : "")
      const timeStr =
        interviewRow.developer_selected_slot ??
        (Array.isArray(interviewRow.proposed_time_slots) && interviewRow.proposed_time_slots.length > 0
          ? interviewRow.proposed_time_slots[0]
          : null) ??
        (interviewRow.scheduled_at
          ? new Date(interviewRow.scheduled_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", hour12: false })
          : "—")
      const dateFormatted = dateStr
        ? new Date(dateStr + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
        : "—"
      return {
        ...m,
        interview: {
          id: interviewRow.id,
          date: dateFormatted,
          time: typeof timeStr === "string" ? timeStr : "—",
          meetLink: interviewRow.meet_link ?? null,
        },
      }
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Star className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Eşleşmeler</h1>
            <p className="text-sm text-muted-foreground">
              İş ilanlarınıza uygun bulunan ve kabul edilen adaylar
            </p>
          </div>
        </div>
      </div>

      <MatchesWithFilters matches={matchesWithInterviews} jobs={myJobs || []} />
    </div>
  )
}
