import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, MapPin, DollarSign, ArrowLeft } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { JobApplyButton } from "@/components/job-apply-button"

export default async function IsIlaniDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let hasApplied = false

  if (user) {
    const { data: application } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", id)
      .eq("developer_id", user.id)
      .maybeSingle()

    if (application) {
      hasApplied = true
    }
  }

  const { data: ilan, error } = await supabase
    .from("job_postings")
    .select(`
      *,
      companies (
        id,
        name,
        logo_url,
        industry,
        website
      ),
      job_skills (
        skill_id,
        is_required,
        proficiency_level,
        skills (
          id,
          name,
          category
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error || !ilan) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background py-32">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/is-ilanlari">
            <ArrowLeft className="mr-2 size-4" />
            Tüm İlanlar
          </Link>
        </Button>

        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
              {ilan.companies?.logo_url && (
                <div className="size-20 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  <Building2 className="size-10 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge>{ilan.experience_level}</Badge>
                  <Badge variant="outline">{ilan.job_type}</Badge>
                  <Badge variant="secondary">Aktif</Badge>
                </div>
                <h1 className="text-4xl font-bold mb-3">{ilan.title}</h1>
                <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4" />
                    <span>{ilan.companies?.name}</span>
                  </div>
                  {ilan.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4" />
                      <span>{ilan.location}</span>
                    </div>
                  )}
                  {(ilan.salary_min || ilan.salary_max) && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-4" />
                      <span>
                        {ilan.salary_min?.toLocaleString("tr-TR")} - {ilan.salary_max?.toLocaleString("tr-TR")} ₺
                      </span>
                    </div>
                  )}
                </div>
                <JobApplyButton jobId={ilan.id} jobTitle={ilan.title} label="Başvuru Yap" hasApplied={hasApplied} isAuthenticated={!!user} />
                {ilan.ask_expected_salary && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Bu ilan için başvuru formunda maaş beklentiniz{" "}
                    {ilan.expected_salary_required ? "zorunlu olarak" : "opsiyonel olarak"} sorulacaktır.
                  </p>
                )}
              </div>
            </div>

            <Separator className="my-8" />

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">İş Tanımı</h2>
                <p className="text-muted-foreground whitespace-pre-line">{ilan.description}</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">Gereksinimler</h2>
                <p className="text-muted-foreground whitespace-pre-line">{ilan.requirements}</p>
              </div>

              {ilan.job_skills && ilan.job_skills.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Aranan Yetenekler</h2>
                  <div className="flex flex-wrap gap-2">
                    {ilan.job_skills.map((js: any) => (
                      <Badge key={js.skill_id} variant={js.is_required ? "default" : "secondary"}>
                        {js.skills.name}
                        {js.proficiency_level && ` - ${js.proficiency_level}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {ilan.companies && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Şirket Hakkında</h2>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">{ilan.companies.industry}</p>
                    {ilan.companies.website && (
                      <Button variant="outline" asChild>
                        <Link href={ilan.companies.website} target="_blank">
                          Şirket Websitesi
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <JobApplyButton jobId={ilan.id} jobTitle={ilan.title} label="Bu İlana Başvur" hasApplied={hasApplied} isAuthenticated={!!user} />
        </div>
      </div>
    </div>
  )
}
