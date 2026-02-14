import { createClient } from "@/lib/supabase/server"
import { TakvimView } from "@/components/takvim-view"
import type { CalendarEvent } from "@/lib/calendar-types"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export default async function IKTakvimPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single()

  const companyId = (profile as { company_id?: string } | null)?.company_id
  if (!companyId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Şirket bilgisi bulunamadı.</p>
      </div>
    )
  }

  const { data: companyRow } = await supabase
    .from("companies")
    .select("name")
    .eq("id", companyId)
    .single()
  const companyName = (companyRow as { name?: string } | null)?.name ?? "Şirket"

  const { data: jobIdsRow } = await supabase
    .from("job_postings")
    .select("id")
    .eq("company_id", companyId)
  const jobIds = jobIdsRow?.map((j) => j.id) ?? []

  if (jobIds.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Calendar className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Takvim</h1>
            <p className="text-sm text-muted-foreground">Görüşme takviminiz</p>
          </div>
        </div>
        <Card className="rounded-2xl border-dashed border-border bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="size-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Henüz görüşme yok</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Başvurular sayfasından &quot;Görüşme&quot; durumuna geçerek adaylara görüşme daveti gönderebilirsiniz.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: interviews } = await supabase
    .from("interviews")
    .select(
      `
      id,
      application_id,
      scheduled_at,
      proposed_date,
      proposed_time_slots,
      developer_selected_slot,
      meet_link,
      title,
      applications:application_id (
        id,
        job_postings:job_id ( title ),
        profiles:developer_id ( full_name )
      )
    `
    )
    .in("status", ["scheduled", "rescheduled"])
    .order("scheduled_at", { ascending: true })

  const applicationIds = (interviews ?? [])
    .map((i) => (i as { application_id?: string }).application_id)
    .filter(Boolean) as string[]
  const { data: appJobs } = await supabase
    .from("applications")
    .select("id, job_id")
    .in("id", applicationIds.length > 0 ? applicationIds : [""])
  const applicationIdToJobId = new Map(
    (appJobs ?? []).map((a: { id: string; job_id: string }) => [a.id, a.job_id])
  )
  const jobIdsFromInterviews = Array.from(applicationIdToJobId.values())
  const { data: companyJobsList } = await supabase
    .from("job_postings")
    .select("id")
    .in("id", jobIdsFromInterviews.length > 0 ? jobIdsFromInterviews : [""])
    .eq("company_id", companyId)
  const companyJobIds = new Set((companyJobsList ?? []).map((j: { id: string }) => j.id))

  const filteredInterviews = (interviews ?? []).filter((i) => {
    const appId = (i as { application_id?: string }).application_id
    const jobId = appId ? applicationIdToJobId.get(appId) : null
    return jobId && companyJobIds.has(jobId)
  })

  const events: CalendarEvent[] = filteredInterviews.map((int) => {
    const row = int as {
      id: string
      application_id: string
      proposed_date?: string | null
      proposed_time_slots?: string[] | null
      developer_selected_slot?: string | null
      scheduled_at?: string
      meet_link?: string | null
      applications?: {
        job_postings?: { title?: string }
        profiles?: { full_name?: string }
      } | { job_postings?: { title?: string }; profiles?: { full_name?: string } }[]
    }
    const app = Array.isArray(row.applications) ? row.applications[0] : row.applications
    const jobTitle = app?.job_postings?.title ?? "Görüşme"
    const candidateName = app?.profiles?.full_name ?? "Aday"
    const dateStr =
      row.proposed_date ?? (row.scheduled_at ? row.scheduled_at.slice(0, 10) : "")
    const timeStr =
      row.developer_selected_slot ??
      (Array.isArray(row.proposed_time_slots) && row.proposed_time_slots.length > 0
        ? row.proposed_time_slots[0]
        : null) ??
      (row.scheduled_at
        ? new Date(row.scheduled_at).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "—")

    return {
      date: dateStr,
      time: typeof timeStr === "string" ? timeStr : "—",
      title: jobTitle,
      companyName,
      meetLink: row.meet_link ?? null,
      applicationId: row.application_id,
      interviewId: row.id,
      candidateName,
    }
  })

  return (
    <TakvimView
      events={events}
      title="Takvim"
      subtitle="Planlanan görüşmeleriniz"
      emptyMessage="Bu tarihte görüşme yok"
    />
  )
}
