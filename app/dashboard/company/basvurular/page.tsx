import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import { ApplicationsWithSegments } from "@/app/dashboard/ik/basvurular/_components/ApplicationsWithSegments"

export default async function CompanyApplicationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  const { data: companyJobs } = await supabase
    .from("job_postings")
    .select("id")
    .eq("company_id", profile?.company_id ?? "")

  const jobIds = companyJobs?.map((job) => job.id) || []

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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Başvurular</h1>
        <p className="text-muted-foreground">Şirket ilanlarınıza yapılan başvuruları inceleyin</p>
      </div>

      {!applications || applications.length === 0 ? (
        <Card className="border-dashed bg-card border-border">
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
          assignedApplicationIds={[]}
          showAssignButton={false}
        />
      )}
    </div>
  )
}
