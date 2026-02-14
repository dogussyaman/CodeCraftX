import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Video, Clock, User } from "lucide-react"
import Link from "next/link"

export default async function HRGorusmelerPage() {
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

  const { data: jobIdsRow } = await supabase
    .from("job_postings")
    .select("id")
    .eq("company_id", companyId)
  const jobIds = jobIdsRow?.map((j) => j.id) || []

  if (jobIds.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Calendar className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Görüşmeler</h1>
            <p className="text-sm text-muted-foreground">Planlanan görüşmelerinizi görün</p>
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
      status,
      applications:application_id (
        id,
        job_postings:job_id ( title ),
        profiles:developer_id ( full_name, email )
      )
    `
    )
    .in("status", ["scheduled", "rescheduled"])
    .order("scheduled_at", { ascending: true })

  const applicationIds = (interviews || [])
    .map((i) => (i as { application_id?: string }).application_id)
    .filter(Boolean) as string[]
  const { data: appJobs } = await supabase
    .from("applications")
    .select("id, job_id")
    .in("id", applicationIds.length > 0 ? applicationIds : [""])
  const applicationIdToJobId = new Map(
    (appJobs || []).map((a: { id: string; job_id: string }) => [a.id, a.job_id])
  )
  const jobIdsFromInterviews = Array.from(applicationIdToJobId.values())
  const { data: companyJobsList } = await supabase
    .from("job_postings")
    .select("id")
    .in("id", jobIdsFromInterviews.length > 0 ? jobIdsFromInterviews : [""])
    .eq("company_id", companyId)
  const companyJobIds = new Set((companyJobsList || []).map((j: { id: string }) => j.id))
  const filteredInterviews = (interviews || []).filter((i) => {
    const appId = (i as { application_id?: string }).application_id
    const jobId = appId ? applicationIdToJobId.get(appId) : null
    return jobId && companyJobIds.has(jobId)
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
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-primary/10 p-3">
          <Calendar className="size-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Görüşmeler</h1>
          <p className="text-sm text-muted-foreground">Planlanan görüşmelerinizi görün</p>
        </div>
      </div>

      {filteredInterviews.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="size-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Henüz görüşme yok</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Başvurular sayfasından &quot;Görüşme&quot; durumuna geçerek adaylara görüşme daveti gönderebilirsiniz.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredInterviews.map((int: Record<string, unknown>) => {
            const app = int.applications as
              | { job_postings?: { title?: string }; profiles?: { full_name?: string; email?: string } }
              | { job_postings?: { title?: string }; profiles?: { full_name?: string; email?: string } }[]
              | null
            const appSingle = Array.isArray(app) ? app[0] : app
            const jobTitle = appSingle?.job_postings?.title || "İlan"
            const devName = appSingle?.profiles?.full_name || "Aday"
            const confirmed = !!int.developer_confirmed_at
            const selectedSlot = int.developer_selected_slot as string | null
            const proposedDate = int.proposed_date as string | null
            const meetLink = int.meet_link as string | null

            return (
              <Card key={int.id as string} className="rounded-2xl border border-border bg-card shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        {devName}
                      </CardTitle>
                      <CardDescription>{jobTitle}</CardDescription>
                    </div>
                    <Badge variant={confirmed ? "success" : "warning"}>
                      {confirmed ? "Onaylandı" : "Onay bekliyor"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4" />
                    {proposedDate && formatDate(proposedDate)}
                    {selectedSlot && ` — ${selectedSlot}`}
                    {!proposedDate && int.scheduled_at && formatDateTime(int.scheduled_at as string)}
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
          })}
        </div>
      )}
    </div>
  )
}
