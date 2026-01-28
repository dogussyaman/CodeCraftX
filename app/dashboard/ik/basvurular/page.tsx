import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Clock } from "lucide-react"
import { HrApplicationActions } from "../_components/HrApplicationActions"

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
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: "Bekliyor", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
      reviewed: { label: "İncelendi", className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
      interview: { label: "Görüşme", className: "bg-purple-500/10 text-purple-700 dark:text-purple-400" },
      rejected: { label: "Reddedildi", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
      accepted: { label: "Kabul Edildi", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
    }

    const config = statusConfig[status] || { label: status, className: "" }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Başvurular</h1>
        <p className="text-muted-foreground">İlanlarınıza yapılan başvuruları inceleyin</p>
      </div>

      {!applications || applications.length === 0 ? (
        <Card className="border-dashed bg-card dark:bg-zinc-900/50 dark:border-zinc-800">
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
            <Card key={application.id} className="bg-card border-border/50 dark:bg-zinc-900/50 dark:border-zinc-800">
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
