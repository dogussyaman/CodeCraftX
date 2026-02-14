import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import { ApplicationsWithSegments } from "./_components/ApplicationsWithSegments"

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

  const { data: myJobs } = await supabase
    .from("job_postings")
    .select("id")
    .eq("company_id", profile?.company_id ?? "")

  const jobIds = myJobs?.map((job) => job.id) || []

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

  const applicationIds = applications?.map((a: { id: string }) => a.id) || []
  const { data: myAssignments } = await supabase
    .from("application_assignments")
    .select("application_id")
    .eq("assigned_to", user!.id)
    .in("application_id", applicationIds.length > 0 ? applicationIds : [""])
  const assignedApplicationIds = Array.from(
    new Set(
      (myAssignments || []).map((a: { application_id: string }) => a.application_id)
    )
  )

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
        <ApplicationsWithSegments
          applications={applications as Parameters<typeof ApplicationsWithSegments>[0]["applications"]}
          assignedApplicationIds={assignedApplicationIds}
        />
      )}
    </div>
  )
}
