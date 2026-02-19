"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Search, Filter, Sparkles, RefreshCw, Mail, Phone, Calendar, FileText, User } from "lucide-react"
import { toast } from "sonner"
import { MatchAnalysisCard } from "@/app/dashboard/ik/basvurular/_components/MatchAnalysisCard"
import { CvDownloadButton } from "@/components/cv-download-button"
import { HrApplicationActions } from "@/app/dashboard/ik/_components/HrApplicationActions"
import { AddToMatchesButton } from "./AddToMatchesButton"
import { Slider } from "@/components/ui/slider"
import { APPLICATION_STATUS_MAP } from "@/lib/status-variants"

type MatchDetails = {
  matching_skills?: string[]
  missing_skills?: string[]
  missing_optional?: string[]
}

type ApplicationRow = {
  id: string
  developer_id: string
  status: string
  created_at: string
  expected_salary?: number
  cover_letter?: string
  match_score?: number | null
  match_reason?: string | null
  match_details?: MatchDetails | null
  ats_scores?: { final_score: number | null }[] | null
  job_postings?: { title?: string } | null
  profiles?: { full_name?: string; email?: string; phone?: string } | null
  cvs?: { file_name?: string; file_url?: string } | null
}

interface ApplicationDashboardProps {
  jobId: string
  applications: ApplicationRow[]
  matchedDeveloperIds: string[]
}

export function ApplicationDashboard({ jobId, applications, matchedDeveloperIds }: ApplicationDashboardProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100])
  const [skillFilter, setSkillFilter] = useState("")
  const [aiRecommendedOnly, setAiRecommendedOnly] = useState(false)
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [bulkAnalyzing, setBulkAnalyzing] = useState(false)
  const [localAnalysis, setLocalAnalysis] = useState<
    Record<
      string,
      {
        match_score: number
        match_reason: string
        match_details: MatchDetails
      }
    >
  >({})
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRow | null>(null)
  const router = useRouter()

  const runAnalysis = async (applicationId: string) => {
    setAnalyzingId(applicationId)
    try {
      const res = await fetch("/api/applications/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || "Analiz başarısız")
        return
      }
      if (data.success && data.match_score != null) {
        setLocalAnalysis((prev) => ({
          ...prev,
          [applicationId]: {
            match_score: data.match_score,
            match_reason: data.match_reason ?? "",
            match_details: data.match_details ?? {},
          },
        }))
        toast.success("AI analizi tamamlandı")
      }
    } catch (error) {
      console.error(error)
      toast.error("Analiz sırasında bir hata oluştu")
    } finally {
      setAnalyzingId(null)
    }
  }

  const runBulkAnalysis = async () => {
    if (!applications.length) return
    setBulkAnalyzing(true)
    try {
      const ids = applications.map((a) => a.id)
      const chunkSize = 5
      for (let i = 0; i < ids.length; i += chunkSize) {
        const slice = ids.slice(i, i + chunkSize)
        await Promise.all(slice.map((id) => runAnalysis(id)))
      }
      toast.success("Tüm başvurular için AI analizi tetiklendi")
    } finally {
      setBulkAnalyzing(false)
    }
  }

  const filtered = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim()
    const normalizedSkill = skillFilter.toLowerCase().trim()

    return applications
      .map((app) => {
        const override = localAnalysis[app.id]
        if (!override) return app
        return {
          ...app,
          match_score: override.match_score,
          match_reason: override.match_reason,
          match_details: override.match_details,
        }
      })
      .filter((app) => {
        const effectiveScore =
          typeof app.ats_scores?.[0]?.final_score === "number"
            ? app.ats_scores[0].final_score
            : typeof app.match_score === "number"
              ? app.match_score
              : null

        // Skor aralığı
        if (effectiveScore !== null && (effectiveScore < scoreRange[0] || effectiveScore > scoreRange[1])) {
          return false
        }

        // AI önerisi: en az %60 ve null olmayan skor
        if (aiRecommendedOnly && (effectiveScore === null || effectiveScore < 60)) {
          return false
        }

        // Durum filtresi
        if (statusFilter !== "all" && app.status !== statusFilter) {
          return false
        }

        // Arama (isim, email, job title)
        if (normalizedSearch) {
          const haystack = [
            app.profiles?.full_name ?? "",
            app.profiles?.email ?? "",
            app.job_postings?.title ?? "",
          ]
            .join(" ")
            .toLowerCase()
          if (!haystack.includes(normalizedSearch)) return false
        }

        // Skill filtresi (matching_skills / missing_skills içinde)
        if (normalizedSkill) {
          const md = app.match_details as MatchDetails | null | undefined
          const allSkills = [
            ...(md?.matching_skills || []),
            ...(md?.missing_skills || []),
            ...(md?.missing_optional || []),
          ]
            .join(" ")
            .toLowerCase()
          if (!allSkills.includes(normalizedSkill)) {
            return false
          }
        }

        return true
      })
      .sort((a, b) => {
        const aScore = typeof a.match_score === "number" ? a.match_score : -1
        const bScore = typeof b.match_score === "number" ? b.match_score : -1
        return bScore - aScore
      })
  }, [applications, search, statusFilter, scoreRange, skillFilter, aiRecommendedOnly, localAnalysis])

  const resetFilters = () => {
    setSearch("")
    setStatusFilter("all")
    setScoreRange([0, 100])
    setSkillFilter("")
    setAiRecommendedOnly(false)
  }

  const uniqueStatuses = Array.from(new Set(applications.map((a) => a.status)))

  return (
    <div className="space-y-6">
      {/* Son Başvuru Durumları - referans görseldeki "Latest Application Status" bölümü */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Son başvuru durumları
        </h2>
        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <Filter className="size-3.5" />
              Filtre
            </div>
            <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={aiRecommendedOnly ? "default" : "outline"}
              className="gap-1.5 rounded-full text-xs"
              onClick={() => setAiRecommendedOnly((v) => !v)}
            >
              <Sparkles className="size-3" />
              AI önerisi
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 rounded-full text-xs"
              onClick={resetFilters}
            >
              <RefreshCw className="size-3" />
              Sıfırla
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2 flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/70 bg-muted/30 px-3 py-2">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ara — ad, e-posta veya pozisyon"
                className="h-8 border-none bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
              />
            </div>
            <Badge variant="secondary" className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium">
              Filtre
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>AI eşleşme aralığı</span>
              <span>
                %{scoreRange[0]} - %{scoreRange[1]}
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={5}
              value={scoreRange}
              onValueChange={(val: number[]) => setScoreRange([val[0], val[1]] as [number, number])}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Durum</span>
            </div>
            <div className="flex flex-wrap gap-1">
              <Badge
                variant={statusFilter === "all" ? "default" : "outline"}
                className="cursor-pointer rounded-full text-[11px]"
                onClick={() => setStatusFilter("all")}
              >
                Tümü
              </Badge>
              {uniqueStatuses.map((status) => (
                <Badge
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  className="cursor-pointer rounded-full text-[11px]"
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Skill filtresi</span>
            </div>
            <Input
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="Örn: React, Next.js"
              className="h-8 rounded-xl border-border/70 bg-background text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {filtered.length} / {applications.length} başvuru görüntüleniyor
          </span>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 rounded-full text-xs"
            onClick={runBulkAnalysis}
            disabled={bulkAnalyzing || !applications.length}
          >
            <Sparkles className="size-3" />
            {bulkAnalyzing ? "AI analiz yapılıyor..." : "Tümüne AI analiz uygula"}
          </Button>
        </div>
      </div>

      {/* Grid cards - her kartta: İsim, Pozisyon, Durum, Başvuru tarihi, Eylem */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((application) => {
          const display = localAnalysis[application.id]
            ? {
                ...application,
                match_score: localAnalysis[application.id].match_score,
                match_reason: localAnalysis[application.id].match_reason,
                match_details: localAnalysis[application.id].match_details,
              }
            : application

          const hasAnalysis =
            typeof display.match_score === "number" ||
            display.match_reason ||
            (display.match_details &&
              ((display.match_details.matching_skills && display.match_details.matching_skills.length > 0) ||
                (display.match_details.missing_skills && display.match_details.missing_skills.length > 0) ||
                (display.match_details.missing_optional && display.match_details.missing_optional.length > 0)))

          const ribbonColor =
            typeof display.match_score === "number"
              ? display.match_score >= 80
                ? "bg-emerald-500"
                : display.match_score >= 60
                  ? "bg-blue-500"
                  : display.match_score >= 40
                    ? "bg-amber-500"
                    : "bg-red-500"
              : "bg-muted-foreground"

          return (
            <div
              key={application.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedApplication(application)}
              onKeyDown={(e) => e.key === "Enter" && setSelectedApplication(application)}
              className="relative cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              {/* Diagonal AI match ribbon */}
              {typeof display.match_score === "number" && (
                <div className="pointer-events-none absolute -right-12 -top-8 z-10 rotate-45">
                  <div className={`w-32 py-1.5 text-center text-xs font-semibold text-background ${ribbonColor}`}>
                    %{display.match_score} uyum
                  </div>
                </div>
              )}

              <div className="relative flex h-full flex-col p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {application.profiles?.full_name || "İsimsiz Aday"}
                      </p>
                      {matchedDeveloperIds.includes(application.developer_id) && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/40 bg-emerald-500/5 text-[10px] text-emerald-600 dark:text-emerald-400"
                        >
                          Eşleşmelerde
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {application.profiles?.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground/80">
                      {application.job_postings?.title}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <Badge
                      variant={(APPLICATION_STATUS_MAP[application.status]?.variant as "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "accent") ?? "secondary"}
                      className="text-[10px] shrink-0"
                    >
                      {APPLICATION_STATUS_MAP[application.status]?.label ?? application.status}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={
                        analyzingId === application.id
                          ? "px-2 py-0.5 text-[11px] opacity-70"
                          : "px-2 py-0.5 text-[11px] cursor-pointer"
                      }
                      onClick={() => analyzingId !== application.id && runAnalysis(application.id)}
                    >
                      {analyzingId === application.id ? "Analiz ediliyor" : "AI analiz yap"}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(application.created_at).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>

                <div
                  className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  {application.cvs?.file_url && (
                    <CvDownloadButton
                      applicationId={application.id}
                      fileUrl={application.cvs.file_url}
                      fileName={application.cvs.file_name}
                    />
                  )}
                  {application.profiles?.phone && <span>{application.profiles.phone}</span>}
                </div>

                {hasAnalysis && (
                  <div className="mt-1 rounded-xl border border-border/60 bg-muted/40 px-2 py-1.5">
                    <MatchAnalysisCard
                      matchScore={display.match_score || 0}
                      matchReason={display.match_reason || undefined}
                      matchDetails={display.match_details || undefined}
                    />
                  </div>
                )}

                {application.cover_letter && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Ön yazı: </span>
                    {application.cover_letter}
                  </p>
                )}

                <div
                  className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-wrap gap-1">
                    {((display.match_details?.matching_skills || []).slice(0, 3) || []).map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-5 bg-emerald-500/5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 min-h-8">
                    <AddToMatchesButton
                      applicationId={application.id}
                      jobId={jobId}
                      developerId={application.developer_id}
                      initiallyInMatches={matchedDeveloperIds.includes(application.developer_id)}
                    />
                    <HrApplicationActions
                      applicationId={application.id}
                      initialStatus={application.status}
                      developerId={application.developer_id}
                      jobTitle={application.job_postings?.title || ""}
                      inline
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/40 py-10 text-center text-sm text-muted-foreground">
          Seçili filtrelere uyan başvuru bulunamadı. Filtreleri gevşetmeyi deneyin.
        </div>
      )}

      {/* Aday detay modalı */}
      <Dialog
        open={!!selectedApplication}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedApplication(null)
            router.refresh()
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl border-border bg-background text-foreground shadow-xl">
          {selectedApplication && (() => {
            const app = selectedApplication
            const display = localAnalysis[app.id]
              ? {
                  ...app,
                  match_score: localAnalysis[app.id].match_score,
                  match_reason: localAnalysis[app.id].match_reason,
                  match_details: localAnalysis[app.id].match_details,
                }
              : app
            const hasAnalysis =
              typeof display.match_score === "number" ||
              display.match_reason ||
              (display.match_details &&
                ((display.match_details.matching_skills?.length ?? 0) > 0 ||
                  (display.match_details.missing_skills?.length ?? 0) > 0 ||
                  (display.match_details.missing_optional?.length ?? 0) > 0))
            const sectionClass = "rounded-xl border border-border bg-muted/20 dark:bg-muted/30 p-4"
            return (
              <>
                <DialogHeader className="border-b border-border pb-4 text-left">
                  <DialogTitle className="flex items-center gap-2 text-foreground">
                    <User className="size-5 text-muted-foreground" />
                    {app.profiles?.full_name || "İsimsiz Aday"}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {app.job_postings?.title} — Başvuru detayları ve durum yönetimi
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 pt-4 text-foreground">
                  {/* İletişim */}
                  <div className={`space-y-2 ${sectionClass}`}>
                    <h4 className="text-sm font-semibold text-foreground">İletişim</h4>
                    <div className="flex flex-col gap-1.5 text-sm">
                      {app.profiles?.email && (
                        <a
                          href={`mailto:${app.profiles.email}`}
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:underline"
                        >
                          <Mail className="size-4 shrink-0" />
                          {app.profiles.email}
                        </a>
                      )}
                      {app.profiles?.phone && (
                        <a
                          href={`tel:${app.profiles.phone}`}
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary hover:underline"
                        >
                          <Phone className="size-4 shrink-0" />
                          {app.profiles.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Başvuru bilgisi */}
                  <div className={`flex flex-wrap items-center gap-3 text-sm text-muted-foreground ${sectionClass}`}>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-4 shrink-0" />
                      Başvuru: {new Date(app.created_at).toLocaleDateString("tr-TR", { dateStyle: "long" })}
                    </span>
                    {app.expected_salary != null && (
                      <span>Beklenen maaş: {app.expected_salary.toLocaleString("tr-TR")} ₺</span>
                    )}
                  </div>

                  {/* Durum ve aksiyonlar */}
                  <div className={`${sectionClass} space-y-4`}>
                    <h4 className="text-sm font-semibold text-foreground">Durum ve işlemler</h4>
                    <div className="flex flex-wrap items-end gap-4">
                      <HrApplicationActions
                        applicationId={app.id}
                        initialStatus={app.status}
                        developerId={app.developer_id}
                        jobTitle={app.job_postings?.title || ""}
                      />
                      <AddToMatchesButton
                        applicationId={app.id}
                        jobId={jobId}
                        developerId={app.developer_id}
                        initiallyInMatches={matchedDeveloperIds.includes(app.developer_id)}
                      />
                      {app.cvs?.file_url && (
                        <CvDownloadButton
                          applicationId={app.id}
                          fileUrl={app.cvs.file_url}
                          fileName={app.cvs.file_name}
                        />
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        disabled={analyzingId === app.id}
                        onClick={() => runAnalysis(app.id)}
                      >
                        <Sparkles className="size-3" />
                        {analyzingId === app.id ? "Analiz ediliyor..." : "AI analiz yap"}
                      </Button>
                    </div>
                  </div>

                  {/* AI eşleşme */}
                  {hasAnalysis && (
                    <div className={sectionClass}>
                      <h4 className="text-sm font-semibold text-foreground mb-3">AI eşleşme analizi</h4>
                      <MatchAnalysisCard
                        matchScore={display.match_score || 0}
                        matchReason={display.match_reason || undefined}
                        matchDetails={display.match_details || undefined}
                      />
                    </div>
                  )}

                  {/* Ön yazı */}
                  {app.cover_letter && (
                    <div className={`space-y-2 ${sectionClass}`}>
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <FileText className="size-4" />
                        Ön yazı
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap rounded-lg border border-border bg-background/50 p-3">
                        {app.cover_letter}
                      </p>
                    </div>
                  )}

                  {/* Beceriler özeti */}
                  {display.match_details &&
                    ((display.match_details.matching_skills?.length ?? 0) > 0 ||
                      (display.match_details.missing_skills?.length ?? 0) > 0) && (
                      <div className={`space-y-2 ${sectionClass}`}>
                        <h4 className="text-sm font-semibold text-foreground">Beceriler</h4>
                        <div className="flex flex-wrap gap-2">
                          {(display.match_details.matching_skills || []).map((s) => (
                            <Badge
                              key={s}
                              variant="outline"
                              className="bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
                            >
                              {s}
                            </Badge>
                          ))}
                          {(display.match_details.missing_skills || []).map((s) => (
                            <Badge key={s} variant="outline" className="bg-muted text-muted-foreground">
                              {s} (eksik)
                            </Badge>
                          ))}
                        </div>
                      </div>
                  )}
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}

