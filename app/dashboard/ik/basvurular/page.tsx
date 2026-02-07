import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Clock } from "lucide-react"
import { HrApplicationActions } from "../_components/HrApplicationActions"
import { APPLICATION_STATUS_MAP } from "@/lib/status-variants"

export default async function HRApplicationsPage() {
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
    .select("id")
    .eq("company_id", profile?.company_id ?? "")

  const jobIds = myJobs?.map((job) => job.id) || []

  // Bu ilanlara yapılan başvuruları al
  const { data: applications } = await supabase
    .from("applications")
    .select(
      `
      *,
      job_postings:job_id (
        title
      ),
      profiles:developer_id (
        full_name,
        email,
        phone
      ),
      cvs:cv_id (
        file_name,
        file_url
      )
    `,
    )
    .in("job_id", jobIds.length > 0 ? jobIds : [""])
    .order("created_at", { ascending: false })

  const getStatusBadge = (status: string) => {
    const config = APPLICATION_STATUS_MAP[status] || { label: status, variant: "outline" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Users className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Başvurular</h1>
            <p className="text-sm text-muted-foreground">İlanlarınıza yapılan başvuruları inceleyin</p>
          </div>
        </div>
      </div>

      {!applications || applications.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border bg-muted/30 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="size-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Henüz başvuru yok</h3>
            <p className="text-muted-foreground text-center max-w-md">
              İlanlarınıza başvuru yapıldığında burada görünecek
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((application: any) => (
            <Card key={application.id} className="rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{application.profiles?.full_name}</CardTitle>
                    <CardDescription className="mt-1">{application.job_postings?.title}</CardDescription>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Email: {application.profiles?.email}</div>
                  {application.profiles?.phone && <div>Telefon: {application.profiles.phone}</div>}
                  {typeof application.expected_salary === "number" && (
                    <div>
                      Maaş beklentisi:{" "}
                      <span className="font-medium text-foreground">
                        {application.expected_salary.toLocaleString("tr-TR")} ₺
                      </span>
                    </div>
                  )}
                  {application.cvs?.file_url && (
                    <div>
                      CV:{" "}
                      <a
                        href={application.cvs.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {application.cvs.file_name || "CV'yi görüntüle"}
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  Başvuru: {formatDate(application.created_at)}
                </div>
                {application.cover_letter && (
                  <div className="pt-2 border-t border-border/40 text-sm">
                    <div className="font-medium text-foreground mb-1">Ön yazı</div>
                    <p className="text-muted-foreground whitespace-pre-line line-clamp-4">
                      {application.cover_letter}
                    </p>
                  </div>
                )}
                <div className="pt-2 border-t border-border/40 flex justify-end">
                  <HrApplicationActions
                    applicationId={application.id}
                    initialStatus={application.status}
                    developerId={application.developer_id}
                    jobTitle={application.job_postings?.title || ""}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
