import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Clock } from "lucide-react"
import { APPLICATION_STATUS_MAP_DEV } from "@/lib/status-variants"
import { InterviewAvailability } from "../_components/InterviewAvailability"

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: applications } = await supabase
    .from("applications")
    .select(
      `
      *,
      job_postings:job_id (
        title,
        location,
        job_type,
        company_id,
        companies:company_id (
          name
        )
      ),
      application_notes (
        id,
        title,
        content,
        is_visible_to_developer,
        note_type,
        created_at
      )
    `,
    )
    .eq("developer_id", user!.id)
    .order("created_at", { ascending: false })

  const getStatusBadge = (status: string) => {
    const config = APPLICATION_STATUS_MAP_DEV[status] || { label: status, variant: "outline" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const parseInterviewPayload = (notes: any[]) => {
    const interviewNote = notes.find((note) => note.note_type === "interview")
    if (!interviewNote?.content) return null
    try {
      return JSON.parse(interviewNote.content)
    } catch {
      return null
    }
  }

  const parseInterviewResponse = (notes: any[]) => {
    const responseNote = notes.find((note) => note.note_type === "interview_response")
    if (!responseNote?.content) return null
    try {
      return JSON.parse(responseNote.content)
    } catch {
      return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Başvurularım</h1>
        <p className="text-muted-foreground">Yaptığınız başvuruları takip edin</p>
      </div>

      {!applications || applications.length === 0 ? (
        <Card className="border-dashed bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="size-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Henüz başvuru yapmadınız</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Eşleşmeler sayfasından size uygun pozisyonlara başvurabilirsiniz
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((application: any) => (
            <Card key={application.id} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{application.job_postings?.title}</CardTitle>
                    <CardDescription className="mt-1">{application.job_postings?.companies?.name}</CardDescription>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const notes = application.application_notes ?? []
                  const interviewPayload = parseInterviewPayload(notes)
                  const interviewResponse = parseInterviewResponse(notes)
                  const visibleNote = notes.find(
                    (note: any) => note.is_visible_to_developer && note.note_type !== "interview",
                  )

                  return (
                    <>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="size-4" />
                          Başvuru tarihi: {formatDate(application.created_at)}
                        </div>
                        {application.job_postings?.location && <span>{application.job_postings.location}</span>}
                        {application.job_postings?.job_type && (
                          <span className="capitalize">{application.job_postings.job_type.replace("-", " ")}</span>
                        )}
                      </div>
                      {typeof application.expected_salary === "number" && (
                        <div className="text-sm text-muted-foreground">
                          Sizin maaş beklentiniz:{" "}
                          <span className="font-medium text-foreground">
                            {application.expected_salary.toLocaleString("tr-TR")} ₺
                          </span>
                        </div>
                      )}
                      {visibleNote && (
                        <div className="pt-2 border-t border-border/40 text-sm">
                          <div className="font-medium text-foreground mb-1">Şirketten mesaj</div>
                          <p className="text-muted-foreground whitespace-pre-line">{visibleNote.content}</p>
                        </div>
                      )}
                      {interviewPayload && (
                        <InterviewAvailability
                          applicationId={application.id}
                          jobTitle={application.job_postings?.title ?? ""}
                          companyId={application.job_postings?.company_id ?? null}
                          interview={interviewPayload}
                          existingResponse={interviewResponse ?? undefined}
                        />
                      )}
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
