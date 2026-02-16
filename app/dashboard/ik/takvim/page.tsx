import { createClient } from "@/lib/supabase/server"
import { TakvimView } from "@/components/takvim-view"
import type { CalendarEvent } from "@/lib/calendar-types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Video, Clock, User } from "lucide-react"
import Link from "next/link"

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
      developer_confirmed_at,
      meet_link,
      title,
      notes,
      invited_attendee_ids,
      applications:application_id (
        id,
        job_id,
        developer_id,
        match_score,
        job_postings:job_id ( title, location ),
        profiles:developer_id ( full_name, email, phone )
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

  const matchKey = (jobId: string, devId: string) => `${jobId}|${devId}`
  const { data: matches } = await supabase
    .from("matches")
    .select("job_id, developer_id, matching_skills")
    .in("job_id", jobIds.length > 0 ? jobIds : [""])
  const skillsByKey = new Map<string, string[]>()
  for (const m of matches ?? []) {
    const r = m as { job_id: string; developer_id: string; matching_skills?: string[] | null }
    if (r.job_id && r.developer_id && Array.isArray(r.matching_skills)) {
      skillsByKey.set(matchKey(r.job_id, r.developer_id), r.matching_skills)
    }
  }

  const allAttendeeIds = new Set<string>()
  for (const i of filteredInterviews) {
    const ids = (i as { invited_attendee_ids?: string[] | null }).invited_attendee_ids
    if (Array.isArray(ids)) for (const id of ids) allAttendeeIds.add(id)
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

  const events: CalendarEvent[] = filteredInterviews.map((int) => {
    const row = int as {
      id: string
      application_id: string
      proposed_date?: string | null
      proposed_time_slots?: string[] | null
      developer_selected_slot?: string | null
      scheduled_at?: string
      meet_link?: string | null
      notes?: string | null
      invited_attendee_ids?: string[] | null
      applications?: {
        job_id?: string
        developer_id?: string
        match_score?: number | null
        job_postings?: { title?: string; location?: string }
        profiles?: { full_name?: string; email?: string; phone?: string }
      } | { job_id?: string; developer_id?: string; match_score?: number | null; job_postings?: { title?: string; location?: string }; profiles?: { full_name?: string; email?: string; phone?: string } }[]
    }
    const app = Array.isArray(row.applications) ? row.applications[0] : row.applications
    const jobTitle = app?.job_postings?.title ?? "Görüşme"
    const jobLocation = app?.job_postings?.location ?? null
    const matchScore = app?.match_score ?? null
    const candidateName = app?.profiles?.full_name ?? "Aday"
    const candidateEmail = app?.profiles?.email ?? null
    const candidatePhone = app?.profiles?.phone ?? null
    const jobId = app?.job_id
    const developerId = app?.developer_id
    const matchingSkills =
      jobId && developerId ? skillsByKey.get(matchKey(jobId, developerId)) ?? null : null
    const attendeeIds = row.invited_attendee_ids ?? []
    const attendees = Array.isArray(attendeeIds)
      ? attendeeIds
          .map((id) => attendeeMap.get(id))
          .filter(Boolean) as { id: string; full_name: string; email?: string | null }[]
      : []

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
      candidateEmail,
      candidatePhone,
      jobLocation,
      matchScore,
      matchingSkills,
      attendees,
      notes: row.notes ?? null,
    }
  })

  const todayStr = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const todayInterviews = filteredInterviews.filter((int: Record<string, unknown>) => {
    const proposed = int.proposed_date as string | null
    const scheduled = int.scheduled_at as string | null
    const dateStr = proposed ?? (scheduled ? scheduled.slice(0, 10) : null)
    return dateStr === todayStr
  })

  const formatDate = (d: string | null) =>
    d
      ? new Date(d + "T12:00:00").toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "—"
  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 min-h-screen max-w-8xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Görüşmeler listesi */}
        <aside className="lg:col-span-1 space-y-4 order-2 lg:order-1">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="size-5 text-primary" />
            Bugünkü görüşmeler
          </h2>
          <div className="space-y-3 max-h-[min(65vh,28rem)] overflow-y-auto pr-1">
            {todayInterviews.length === 0 ? (
              <Card className="rounded-2xl border-dashed border-border bg-muted/30">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground text-center">
                    Bugün planlanmış görüşme yok.
                  </p>
                </CardContent>
              </Card>
            ) : (
              todayInterviews.map((int: Record<string, unknown>) => {
                const app = int.applications as
                  | { job_postings?: { title?: string }; profiles?: { full_name?: string } }
                  | { job_postings?: { title?: string }; profiles?: { full_name?: string } }[]
                  | null
                const appSingle = Array.isArray(app) ? app[0] : app
                const jobTitle = appSingle?.job_postings?.title || "İlan"
                const devName = appSingle?.profiles?.full_name || "Aday"
                const confirmed = !!(int as { developer_confirmed_at?: string | null }).developer_confirmed_at
                const selectedSlot = int.developer_selected_slot as string | null
                const proposedDate = int.proposed_date as string | null
                const scheduledAt = int.scheduled_at as string | null
                const meetLink = int.meet_link as string | null

                return (
                  <Card
                    key={int.id as string}
                    className="rounded-2xl border border-border bg-card shadow-sm"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="size-4 text-muted-foreground" />
                            {devName}
                          </CardTitle>
                          <CardDescription>{jobTitle}</CardDescription>
                        </div>
                        <Badge variant={confirmed ? "default" : "secondary"}>
                          {confirmed ? "Onaylandı" : "Onay bekliyor"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="size-4" />
                        {proposedDate && formatDate(proposedDate)}
                        {selectedSlot && ` — ${selectedSlot}`}
                        {!proposedDate && scheduledAt && formatDateTime(scheduledAt)}
                      </div>
                      {meetLink && (
                        <a
                          href={meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <Video className="size-4" />
                          Toplantı linki
                        </a>
                      )}
                      <div className="pt-2">
                        <Link
                          href="/dashboard/ik/basvurular"
                          className="text-primary hover:underline text-xs font-medium"
                        >
                          Başvuruya git →
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </aside>

        {/* Sağ: Takvim */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <TakvimView
            events={events}
            title="Takvim"
            subtitle="Planlanan görüşmeleriniz"
            emptyMessage="Bu tarihte görüşme yok"
            canEditNotes
            disableNoteSaveAndInvite
          />
        </div>
      </div>
    </div>
  )
}
