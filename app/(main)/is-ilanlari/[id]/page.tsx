import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building2, MapPin, ArrowLeft } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { JobApplyButton } from "@/components/job-apply-button"
import { JobSaveButton } from "@/components/job-save-button"
import { JobSectionList } from "../_components/JobSectionList"

type Locale = "tr" | "en" | "de"

function getLocalizedTitle(ilan: any, locale: Locale): string {
  if (locale === "en" && ilan.title_en) return ilan.title_en
  if (locale === "de" && ilan.title_de) return ilan.title_de
  return ilan.title ?? ""
}

function getLocalizedDescription(ilan: any, locale: Locale): string {
  if (locale === "en" && ilan.description_en) return ilan.description_en
  if (locale === "de" && ilan.description_de) return ilan.description_de
  return ilan.description ?? ""
}

function getRequirementsList(ilan: any, locale: Locale): string[] {
  let arr: string[] = []
  if (locale === "en" && Array.isArray(ilan.requirements_en)) arr = ilan.requirements_en
  else if (locale === "de" && Array.isArray(ilan.requirements_de)) arr = ilan.requirements_de
  else if (Array.isArray(ilan.requirements_tr) && ilan.requirements_tr.length > 0) arr = ilan.requirements_tr
  else if (ilan.requirements && typeof ilan.requirements === "string") {
    arr = ilan.requirements.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean)
  }
  return arr
}

function getRequirementsTitle(ilan: any, locale: Locale): string {
  if (locale === "en" && ilan.requirements_title_en) return ilan.requirements_title_en
  if (locale === "de" && ilan.requirements_title_de) return ilan.requirements_title_de
  return ilan.requirements_title_tr ?? "Gereksinimler"
}

function getRequirementsSubtitle(ilan: any, locale: Locale): string | undefined {
  if (locale === "en" && ilan.requirements_subtitle_en) return ilan.requirements_subtitle_en
  if (locale === "de" && ilan.requirements_subtitle_de) return ilan.requirements_subtitle_de
  return ilan.requirements_subtitle_tr
}

function getCandidateCriteriaList(ilan: any, locale: Locale): string[] {
  if (locale === "en" && Array.isArray(ilan.candidate_criteria_en)) return ilan.candidate_criteria_en
  if (locale === "de" && Array.isArray(ilan.candidate_criteria_de)) return ilan.candidate_criteria_de
  if (Array.isArray(ilan.candidate_criteria_tr)) return ilan.candidate_criteria_tr
  return []
}

function getCandidateCriteriaTitle(ilan: any, locale: Locale): string {
  if (locale === "en" && ilan.candidate_criteria_title_en) return ilan.candidate_criteria_title_en
  if (locale === "de" && ilan.candidate_criteria_title_de) return ilan.candidate_criteria_title_de
  return ilan.candidate_criteria_title_tr ?? "Aday Kriterleri"
}

function getResponsibilitiesList(ilan: any, locale: Locale): string[] {
  if (locale === "en" && Array.isArray(ilan.responsibilities_en)) return ilan.responsibilities_en
  if (locale === "de" && Array.isArray(ilan.responsibilities_de)) return ilan.responsibilities_de
  if (Array.isArray(ilan.responsibilities_tr) && ilan.responsibilities_tr.length > 0) return ilan.responsibilities_tr
  if (ilan.responsibilities && typeof ilan.responsibilities === "string") {
    return ilan.responsibilities.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean)
  }
  return []
}

export default async function IsIlaniDetayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const { id } = await params
  const { lang } = await searchParams
  const locale: Locale = lang === "en" || lang === "de" ? lang : "tr"

  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let hasApplied = false
  let isSaved = false

  if (user) {
    const [{ data: application }, { data: savedRow }] = await Promise.all([
      supabase
        .from("applications")
        .select("id")
        .eq("job_id", id)
        .eq("developer_id", user.id)
        .maybeSingle(),
      supabase
        .from("saved_jobs")
        .select("id")
        .eq("job_id", id)
        .eq("developer_id", user.id)
        .maybeSingle(),
    ])
    if (application) hasApplied = true
    if (savedRow) isSaved = true
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

  const title = getLocalizedTitle(ilan, locale)
  const description = getLocalizedDescription(ilan, locale)
  const requirementsList = getRequirementsList(ilan, locale)
  const requirementsTitle = getRequirementsTitle(ilan, locale)
  const requirementsSubtitle = getRequirementsSubtitle(ilan, locale)
  const candidateCriteriaList = getCandidateCriteriaList(ilan, locale)
  const candidateCriteriaTitle = getCandidateCriteriaTitle(ilan, locale)
  const responsibilitiesList = getResponsibilitiesList(ilan, locale)

  const locationDisplay = [ilan.city, ilan.location].filter(Boolean).join(", ") || ilan.location

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
              <div className="size-20 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {ilan.companies?.logo_url ? (
                  <img
                    src={ilan.companies.logo_url}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <Building2 className="size-10 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  {ilan.experience_level && <Badge>{ilan.experience_level}</Badge>}
                  {ilan.job_type && <Badge variant="outline">{ilan.job_type}</Badge>}
                  <Badge variant="secondary">Aktif</Badge>
                </div>
                <h1 className="text-4xl font-bold mb-3">{title}</h1>
                <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4" />
                    <span>{ilan.companies?.name}</span>
                  </div>
                  {locationDisplay && (
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4" />
                      <span>{locationDisplay}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <JobApplyButton jobId={ilan.id} jobTitle={title} label="Başvuru Yap" hasApplied={hasApplied} isAuthenticated={!!user} />
                  <JobSaveButton jobId={ilan.id} initialSaved={isSaved} isAuthenticated={!!user} />
                </div>
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
                <p className="text-muted-foreground whitespace-pre-line">{description}</p>
              </div>

              {(requirementsList.length > 0 || requirementsSubtitle || ilan.requirements_title_tr || ilan.requirements_title_en || ilan.requirements_title_de) && (
                <JobSectionList
                  title={requirementsTitle}
                  subtitle={requirementsSubtitle}
                  items={requirementsList}
                />
              )}

              {candidateCriteriaList.length > 0 && (
                <JobSectionList
                  title={candidateCriteriaTitle}
                  items={candidateCriteriaList}
                />
              )}

              {responsibilitiesList.length > 0 && (
                <JobSectionList
                  title="Sorumluluklar"
                  items={responsibilitiesList}
                />
              )}

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

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <JobApplyButton jobId={ilan.id} jobTitle={title} label="Bu İlana Başvur" hasApplied={hasApplied} isAuthenticated={!!user} />
          <JobSaveButton jobId={ilan.id} initialSaved={isSaved} isAuthenticated={!!user} />
        </div>
      </div>
    </div>
  )
}
