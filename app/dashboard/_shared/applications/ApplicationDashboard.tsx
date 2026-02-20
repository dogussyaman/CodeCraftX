"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Sparkles, RefreshCw, Calendar, Mail, Phone, FileText, User, Filter } from "lucide-react"
import { toast } from "sonner"
import { CvDownloadButton } from "@/components/cv-download-button"
import { HrApplicationActions } from "@/app/dashboard/ik/_components/HrApplicationActions"
import { AddToMatchesButton } from "@/app/dashboard/company/basvurular/[jobId]/_components/AddToMatchesButton"
import { AssignApplicationToMeButton } from "@/app/dashboard/ik/_components/AssignApplicationToMeButton"
import { APPLICATION_STATUS_MAP } from "@/lib/status-variants"
import { MatchAnalysisCard } from "./MatchAnalysisCard"
import type { ApplicationRow, LocalAnalysisResult } from "./types"
import { computeApplicationScore } from "./presentation"

interface ApplicationDashboardProps {
  role: "company" | "hr"
  jobId: string
  applications: ApplicationRow[]
  matchedDeveloperIds: string[]
  assignedApplicationIds?: string[]
  showAssignButton?: boolean
}

export function ApplicationDashboard({
  role,
  jobId,
  applications,
  matchedDeveloperIds,
  assignedApplicationIds = [],
  showAssignButton = false,
}: ApplicationDashboardProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100])
  const [skillFilter, setSkillFilter] = useState("")
  const [aiRecommendedOnly, setAiRecommendedOnly] = useState(false)
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [bulkAnalyzing, setBulkAnalyzing] = useState(false)
  const [localAnalysis, setLocalAnalysis] = useState<Record<string, LocalAnalysisResult>>({})
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRow | null>(null)

  const runAnalysis = async (applicationId: string) => {
    setAnalyzingId(applicationId)
    try {
      const res = await fetch("/api/ats/compute-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        toast.error(data.error || "Analiz başarısız")
        return
      }
      setLocalAnalysis((prev) => ({
        ...prev,
        [applicationId]: {
          match_score: data.match_score ?? 0,
          match_reason: data.match_reason ?? "",
          match_details: data.match_details ?? {},
        },
      }))
      toast.success("ATS analizi tamamlandı")
    } catch (error) {
      console.error(error)
      toast.error("Analiz sırasında hata oluştu")
    } finally {
      setAnalyzingId(null)
    }
  }

  const runBulkAnalysis = async () => {
    if (!applications.length) return
    setBulkAnalyzing(true)
    try {
      const ids = applications.map((item) => item.id)
      const chunkSize = 5
      for (let i = 0; i < ids.length; i += chunkSize) {
        const chunk = ids.slice(i, i + chunkSize)
        await Promise.all(chunk.map((id) => runAnalysis(id)))
      }
      toast.success("Tüm başvurular için ATS analizi tetiklendi")
    } finally {
      setBulkAnalyzing(false)
    }
  }

  const normalized = useMemo(
    () =>
      applications.map((application) => {
        const local = localAnalysis[application.id]
        if (!local) return application
        return {
          ...application,
          match_score: local.match_score,
          match_reason: local.match_reason,
          match_details: local.match_details,
        }
      }),
    [applications, localAnalysis],
  )

  const filtered = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim()
    const normalizedSkill = skillFilter.toLowerCase().trim()

    return normalized
      .filter((application) => {
        const score = computeApplicationScore({
          matchScore: application.match_score,
          atsScores: application.ats_scores,
        })

        if (score !== null && (score < scoreRange[0] || score > scoreRange[1])) return false
        if (aiRecommendedOnly && (score === null || score < 60)) return false
        if (statusFilter !== "all" && application.status !== statusFilter) return false

        if (normalizedSearch) {
          const haystack = [
            application.profiles?.full_name ?? "",
            application.profiles?.email ?? "",
            application.job_postings?.title ?? "",
          ]
            .join(" ")
            .toLowerCase()
          if (!haystack.includes(normalizedSearch)) return false
        }

        if (normalizedSkill) {
          const skillText = [
            ...(application.match_details?.matching_skills ?? []),
            ...(application.match_details?.missing_skills ?? []),
            ...(application.match_details?.missing_optional ?? []),
          ]
            .join(" ")
            .toLowerCase()
          if (!skillText.includes(normalizedSkill)) return false
        }

        return true
      })
      .sort((a, b) => {
        const aScore = computeApplicationScore({ matchScore: a.match_score, atsScores: a.ats_scores }) ?? -1
        const bScore = computeApplicationScore({ matchScore: b.match_score, atsScores: b.ats_scores }) ?? -1
        return bScore - aScore
      })
  }, [normalized, search, skillFilter, scoreRange, aiRecommendedOnly, statusFilter])

  const statuses = Array.from(new Set(applications.map((item) => item.status)))

  const resetFilters = () => {
    setSearch("")
    setSkillFilter("")
    setScoreRange([0, 100])
    setAiRecommendedOnly(false)
    setStatusFilter("all")
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5 dark:border-gray-600 dark:bg-card dark:shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-gray-400">
            <Filter className="size-3.5" />
            Filtreler
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={aiRecommendedOnly ? "default" : "outline"} className={`gap-1.5 rounded-full text-xs ${!aiRecommendedOnly ? "dark:border-gray-500 dark:bg-transparent dark:text-gray-200 dark:hover:bg-white/10" : ""}`} onClick={() => setAiRecommendedOnly((v) => !v)}>
              <Sparkles className="size-3" />
              AI Önerisi
            </Button>
            <Button size="sm" variant="ghost" className="gap-1.5 rounded-full text-xs dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-gray-100" onClick={resetFilters}>
              <RefreshCw className="size-3" />
              Sıfırla
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/25 px-3 py-2 dark:border-gray-600 dark:bg-white/5">
              <Search className="size-4 text-muted-foreground dark:text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Aday, e-posta veya pozisyon ara"
                className="h-8 border-none bg-transparent p-0 text-sm text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground dark:text-gray-400">
              <span>ATS Aralığı</span>
              <span>%{scoreRange[0]} - %{scoreRange[1]}</span>
            </div>
            <Slider min={0} max={100} step={5} value={scoreRange} onValueChange={(v) => setScoreRange([v[0], v[1]])} />
          </div>

          <div>
            <Input
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="Beceri filtresi"
              className="h-9 rounded-xl border-border dark:border-gray-600 dark:bg-white/5 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge
            variant={statusFilter === "all" ? "default" : "outline"}
            className={`cursor-pointer rounded-full ${statusFilter !== "all" ? "dark:border dark:border-gray-500 dark:text-gray-200" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            Tümü
          </Badge>
          {statuses.map((status) => (
            <Badge
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              className={`cursor-pointer rounded-full ${statusFilter !== status ? "dark:border dark:border-gray-500 dark:text-gray-200" : ""}`}
              onClick={() => setStatusFilter(status)}
            >
              {APPLICATION_STATUS_MAP[status]?.label ?? status}
            </Badge>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-400">
            <span>
              {filtered.length} / {applications.length}
            </span>
            <Button size="sm" variant="outline" className="gap-1.5 rounded-full text-xs dark:border-gray-500 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/15" onClick={runBulkAnalysis} disabled={bulkAnalyzing || !applications.length}>
              <Sparkles className="size-3" />
              {bulkAnalyzing ? "Analiz yapılıyor..." : "Tümü için ATS"}
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((application) => {
          const score = computeApplicationScore({ matchScore: application.match_score, atsScores: application.ats_scores })
          const hasAnalysis = score != null || Boolean(application.match_reason || application.match_details)
          const statusMeta = APPLICATION_STATUS_MAP[application.status]
          return (
            <article
              key={application.id}
              className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md dark:border-gray-600 dark:bg-card"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{application.profiles?.full_name || "İsimsiz Aday"}</p>
                  <p className="truncate text-xs text-muted-foreground dark:text-gray-400">{application.profiles?.email}</p>
                  <p className="truncate text-xs text-muted-foreground dark:text-gray-400">{application.job_postings?.title}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={statusMeta?.variant ?? "secondary"} className="text-[10px]">
                    {statusMeta?.label ?? application.status}
                  </Badge>
                  {score != null ? (
                    <Badge variant={score >= 80 ? "success" : score >= 60 ? "default" : score >= 40 ? "warning" : "destructive"} className="text-[10px]">
                      %{score} ATS
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground dark:text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3" />
                  {new Date(application.created_at).toLocaleDateString("tr-TR")}
                </span>
                {application.profiles?.phone ? <span>{application.profiles.phone}</span> : null}
              </div>

              {hasAnalysis ? (
                <div className="mt-3">
                  <MatchAnalysisCard
                    matchScore={score ?? 0}
                    matchReason={application.match_reason ?? undefined}
                    matchDetails={application.match_details ?? undefined}
                  />
                </div>
              ) : null}

              {application.cover_letter ? (
                <p className="mt-3 line-clamp-2 text-xs text-muted-foreground dark:text-gray-400">
                  <span className="font-medium text-foreground dark:text-gray-200">Ön yazı: </span>
                  <span className="dark:text-gray-400">{application.cover_letter}</span>
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 dark:border-gray-600">
                <Button size="sm" variant="outline" className="h-8 gap-1.5 rounded-lg text-xs dark:border-gray-500 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/15" onClick={() => setSelectedApplication(application)}>
                  Aday Detayı
                </Button>
                <Button size="sm" variant="secondary" className="h-8 gap-1.5 rounded-lg text-xs dark:bg-white/15 dark:text-gray-100 dark:hover:bg-white/20" onClick={() => runAnalysis(application.id)} disabled={analyzingId === application.id}>
                  <Sparkles className="size-3" />
                  {analyzingId === application.id ? "Analiz..." : "Analiz Yap"}
                </Button>
              </div>
            </article>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-10 text-center text-sm text-muted-foreground dark:border-gray-600 dark:bg-white/5 dark:text-gray-400">
          Seçili filtrelere uyan başvuru bulunamadı.
        </div>
      ) : null}

      <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border sm:max-w-3xl dark:border-gray-600 dark:bg-card">
          {selectedApplication ? (
            (() => {
              const application = selectedApplication
              const score = computeApplicationScore({
                matchScore: application.match_score,
                atsScores: application.ats_scores,
              })
              const statusMeta = APPLICATION_STATUS_MAP[application.status]
              return (
                <div className="space-y-5">
                  <DialogHeader className="border-b border-border pb-4 text-left dark:border-gray-600">
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                      <User className="size-5 text-primary" />
                      {application.profiles?.full_name || "İsimsiz Aday"}
                    </DialogTitle>
                    <DialogDescription className="dark:text-gray-400">
                      {application.job_postings?.title} - {role === "hr" ? "İK detay görünümü" : "Şirket detay görünümü"}
                    </DialogDescription>
                  </DialogHeader>

                  <section className="rounded-xl border border-border bg-muted/25 p-4 dark:border-gray-600 dark:bg-white/5">
                    <h4 className="text-sm font-semibold text-foreground dark:text-gray-100">Aday Bilgileri</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      {application.profiles?.email ? (
                        <a href={`mailto:${application.profiles.email}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary dark:text-gray-300 dark:hover:text-primary">
                          <Mail className="size-4" />
                          {application.profiles.email}
                        </a>
                      ) : null}
                      {application.profiles?.phone ? (
                        <a href={`tel:${application.profiles.phone}`} className="block text-muted-foreground hover:text-primary dark:text-gray-300 dark:hover:text-primary">
                          <span className="inline-flex items-center gap-2">
                            <Phone className="size-4" />
                            {application.profiles.phone}
                          </span>
                        </a>
                      ) : null}
                    </div>
                  </section>

                  <section className="rounded-xl border border-border bg-muted/25 p-4 dark:border-gray-600 dark:bg-white/5">
                    <h4 className="text-sm font-semibold text-foreground dark:text-gray-100">Başvuru Bilgisi</h4>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground dark:text-gray-400">
                      <span>{new Date(application.created_at).toLocaleDateString("tr-TR", { dateStyle: "long" })}</span>
                      {application.expected_salary != null ? <span>Beklenen maaş: {application.expected_salary.toLocaleString("tr-TR")} TL</span> : null}
                      <Badge variant={statusMeta?.variant ?? "secondary"}>{statusMeta?.label ?? application.status}</Badge>
                    </div>
                  </section>

                  <section className="rounded-xl border border-border bg-muted/25 p-4 dark:border-gray-600 dark:bg-white/5">
                    <h4 className="text-sm font-semibold text-foreground dark:text-gray-100">Durum ve İşlemler</h4>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {showAssignButton ? (
                        <AssignApplicationToMeButton
                          applicationId={application.id}
                          alreadyAssigned={assignedApplicationIds.includes(application.id)}
                        />
                      ) : null}
                      <HrApplicationActions
                        applicationId={application.id}
                        initialStatus={application.status}
                        developerId={application.developer_id}
                        jobTitle={application.job_postings?.title || ""}
                      />
                      <AddToMatchesButton
                        applicationId={application.id}
                        jobId={jobId}
                        developerId={application.developer_id}
                        initiallyInMatches={matchedDeveloperIds.includes(application.developer_id)}
                      />
                      {application.cvs?.file_url ? (
                        <CvDownloadButton applicationId={application.id} fileUrl={application.cvs.file_url} fileName={application.cvs.file_name ?? undefined} />
                      ) : null}
                    </div>
                  </section>

                  {score != null || application.match_reason || application.match_details ? (
                    <section className="rounded-xl border border-border bg-muted/25 p-4 dark:border-gray-600 dark:bg-white/5">
                      <h4 className="mb-3 text-sm font-semibold text-foreground dark:text-gray-100">ATS Analiz Detayı</h4>
                      <MatchAnalysisCard
                        matchScore={score ?? 0}
                        matchReason={application.match_reason ?? undefined}
                        matchDetails={application.match_details ?? undefined}
                      />
                    </section>
                  ) : null}

                  {application.cover_letter ? (
                    <section className="rounded-xl border border-border bg-muted/25 p-4 dark:border-gray-600 dark:bg-white/5">
                      <h4 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-foreground dark:text-gray-100">
                        <FileText className="size-4" />
                        Ön Yazı
                      </h4>
                      <p className="whitespace-pre-wrap rounded-lg border border-border bg-background/70 p-3 text-sm text-muted-foreground dark:border-gray-600 dark:bg-white/5 dark:text-gray-300">
                        {application.cover_letter}
                      </p>
                    </section>
                  ) : null}
                </div>
              )
            })()
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

