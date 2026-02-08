import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarClock, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function HRInterviewsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user!.id)
    .single()

  const { data: myJobs } = await supabase
    .from("job_postings")
    .select("id")
    .eq("company_id", profile?.company_id ?? "")

  const jobIds = myJobs?.map((job) => job.id) || []

  const { data: applications } = await supabase
    .from("applications")
    .select(
      `
      id,
      status,
      created_at,
      job_postings:job_id (
        title
      ),
      profiles:developer_id (
        full_name,
        email
      ),
      application_notes (
        id,
        note_type,
        content,
        created_at
      )
    `,
    )
    .in("job_id", jobIds.length > 0 ? jobIds : [""])
    .eq("status", "interview")
    .order("created_at", { ascending: false })

  const parsePayload = (notes: any[], type: string) => {
    const note = notes.find((item) => item.note_type === type)
    if (!note?.content) return null
    try {
      return JSON.parse(note.content)
    } catch {
      return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-primary/10 p-3">
          <CalendarClock className="size-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Görüşmeler</h1>
          <p className="text-sm text-muted-foreground">Planlanan görüşmeler ve aday yanıtları</p>
        </div>
      </div>

      {!applications || applications.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border bg-muted/30 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="size-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Henüz görüşme yok</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Görüşme daveti gönderdiğiniz adaylar burada görünecek
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((application: any) => {
            const notes = application.application_notes ?? []
            const interview = parsePayload(notes, "interview")
            const response = parsePayload(notes, "interview_response")

            return (
              <Card key={application.id} className="rounded-2xl border border-border bg-card shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{application.profiles?.full_name}</CardTitle>
                      <CardDescription className="mt-1">{application.job_postings?.title}</CardDescription>
                    </div>
                    <Badge variant="secondary">Görüşme</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div>Email: {application.profiles?.email}</div>
                  {interview && (
                    <div className="space-y-1">
                      <div>Tarih: {interview.date}</div>
                      <div>Seçenekler: {interview.timeOptions?.join(", ")}</div>
                      {interview.link && (
                        <div>
                          Meet:{" "}
                          <a href={interview.link} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                            {interview.link}
                          </a>
                        </div>
                      )}
                      {interview.location && <div>Konum: {interview.location}</div>}
                    </div>
                  )}
                  {response ? (
                    <div className="rounded-lg border border-border/60 bg-muted/40 p-3">
                      <div className="text-foreground font-medium">Aday Yanıtı</div>
                      <div>Saat: {response.selectedTime}</div>
                      <div>Katılım: {response.attending ? "Katılacak" : "Katılamıyor"}</div>
                      {response.note && <div>Not: {response.note}</div>}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">Adaydan henüz yanıt gelmedi.</div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
