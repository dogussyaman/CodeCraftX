"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Users, Clock, Trash2 } from "lucide-react"
import { HrApplicationActions } from "../../_components/HrApplicationActions"
import { CvDownloadButton } from "@/components/cv-download-button"
import { AssignApplicationToMeButton } from "../../_components/AssignApplicationToMeButton"
import { APPLICATION_STATUS_MAP } from "@/lib/status-variants"
import { toast } from "sonner"
import { MatchAnalysisCard } from "./MatchAnalysisCard"

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
  job_postings?: { title?: string } | null
  profiles?: { full_name?: string; email?: string; phone?: string } | null
  cvs?: { file_name?: string; file_url?: string } | null
}

type LocalAnalysisResult = {
  match_score: number
  match_reason: string
  match_details: MatchDetails
}

const SEGMENTS = [
  { value: "all", label: "Tümü" },
  { value: "high", label: "Yüksek (80-100)" },
  { value: "mid", label: "Orta (50-80)" },
  { value: "low", label: "Düşük (50 altı)" },
] as const

function getStatusBadge(status: string) {
  const config = APPLICATION_STATUS_MAP[status] || { label: status, variant: "outline" as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

interface ApplicationsWithSegmentsProps {
  applications: ApplicationRow[]
  assignedApplicationIds: string[]
  /** Company sayfasında "üstlen" butonu gösterilmez */
  showAssignButton?: boolean
}

export function ApplicationsWithSegments({
  applications,
  assignedApplicationIds,
  showAssignButton = true,
}: ApplicationsWithSegmentsProps) {
  const [segment, setSegment] = useState<"all" | "high" | "mid" | "low">("all")
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false)
  const [bulkRejectLoading, setBulkRejectLoading] = useState(false)
  const [feedbackTemplates, setFeedbackTemplates] = useState<{ id: string; title: string; body: string }[]>([])
  const [bulkTemplateId, setBulkTemplateId] = useState<string>("__none__")
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [localAnalysis, setLocalAnalysis] = useState<Record<string, LocalAnalysisResult>>({})
  const supabase = createClient()

  const filtered = useMemo(() => {
    if (segment === "all") return applications
    return applications.filter((a) => {
      const display = localAnalysis[a.id] ?? a
      const s = display.match_score ?? null
      if (s === null) return segment === "low"
      if (segment === "high") return s >= 80
      if (segment === "mid") return s >= 50 && s < 80
      return s < 50
    })
  }, [applications, segment, localAnalysis])

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
        toast.success("Analiz tamamlandı")
      }
    } catch (e) {
      console.error(e)
      toast.error("Analiz başarısız")
    } finally {
      setAnalyzingId(null)
    }
  }

  const openBulkReject = () => {
    setBulkRejectOpen(true)
    supabase
      .from("feedback_templates")
      .select("id, title, body")
      .order("type")
      .then(({ data }) => setFeedbackTemplates((data as { id: string; title: string; body: string }[]) || []))
  }

  const submitBulkReject = async () => {
    const ids = filtered.map((a) => a.id)
    if (ids.length === 0) return
    setBulkRejectLoading(true)
    try {
      const res = await fetch("/api/applications/bulk-reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationIds: ids,
          templateId: bulkTemplateId !== "__none__" ? bulkTemplateId : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || "Toplu red başarısız")
        setBulkRejectLoading(false)
        return
      }
      toast.success(`${data.count ?? ids.length} başvuru reddedildi`)
      setBulkRejectOpen(false)
      window.location.reload()
    } catch (e) {
      console.error(e)
      toast.error("İşlem başarısız")
    } finally {
      setBulkRejectLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {SEGMENTS.map((s) => (
          <Button
            key={s.value}
            variant={segment === s.value ? "default" : "outline"}
            size="sm"
            onClick={() => setSegment(s.value)}
          >
            {s.label}
          </Button>
        ))}
        {segment === "low" && filtered.length > 0 && (
          <Button variant="destructive" size="sm" className="ml-2" onClick={openBulkReject}>
            <Trash2 className="size-4 mr-1" />
            Tümünü reddet ({filtered.length})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map((application) => {
          const display = localAnalysis[application.id] ?? application
          const hasAnalysis =
            typeof display.match_score === "number" ||
            display.match_reason ||
            (display.match_details && (display.match_details.matching_skills?.length || display.match_details.missing_skills?.length || display.match_details.missing_optional?.length))
          return (
            <Card
              key={application.id}
              className="rounded-xl border border-border bg-card shadow-sm hover:border-primary/30 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{application.profiles?.full_name}</CardTitle>
                    <CardDescription className="mt-1">{application.job_postings?.title}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {typeof display.match_score === "number" && (
                      <Badge
                        variant={
                          display.match_score >= 80
                            ? "success"
                            : display.match_score >= 50
                              ? "default"
                              : "destructive"
                        }
                      >
                        %{display.match_score} eşleşme
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className={
                        analyzingId === application.id
                          ? "px-3 py-1 opacity-70 cursor-wait"
                          : "cursor-pointer px-3 py-1 hover:bg-secondary/80 transition-colors select-none"
                      }
                      role="button"
                      tabIndex={analyzingId === application.id ? -1 : 0}
                      onClick={() => analyzingId !== application.id && runAnalysis(application.id)}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === " ") && analyzingId !== application.id) runAnalysis(application.id)
                      }}
                      aria-disabled={analyzingId === application.id}
                    >
                      {analyzingId === application.id ? "Analiz ediliyor" : "Analiz yap"}
                    </Badge>
                    {getStatusBadge(application.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                  <span>{application.profiles?.email}</span>
                  {application.profiles?.phone && <span>{application.profiles.phone}</span>}
                  {application.cvs?.file_url && (
                    <CvDownloadButton
                      applicationId={application.id}
                      fileUrl={application.cvs.file_url}
                      fileName={application.cvs.file_name}
                    />
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDate(application.created_at)}
                  </span>
                </div>
                {application.cover_letter && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    <span className="font-medium text-foreground">Ön yazı:</span>{" "}
                    {application.cover_letter}
                  </p>
                )}
                {hasAnalysis && (
                  <div className="border-t border-border/40 pt-1">
                    <MatchAnalysisCard
                      matchScore={display.match_score || 0}
                      matchReason={display.match_reason || undefined}
                      matchDetails={display.match_details || undefined}
                    />
                  </div>
                )}
                <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-2">
                  {showAssignButton && (
                    <AssignApplicationToMeButton
                      applicationId={application.id}
                      alreadyAssigned={assignedApplicationIds.includes(application.id)}
                    />
                  )}
                  <HrApplicationActions
                    applicationId={application.id}
                    initialStatus={application.status}
                    developerId={application.developer_id}
                    jobTitle={application.job_postings?.title || ""}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="rounded-2xl border-dashed border-border bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="size-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Bu segmentte başvuru yok</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Farklı bir segment seçin veya tüm başvuruları görün.
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={bulkRejectOpen} onOpenChange={setBulkRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Toplu red</DialogTitle>
            <DialogDescription>
              Seçilen {filtered.length} başvuruyu reddedeceksiniz. Adaylara gönderilecek mesajı seçin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {feedbackTemplates.length > 0 && (
              <div className="space-y-2">
                <Label>Hazır kalıp</Label>
                <Select value={bulkTemplateId} onValueChange={setBulkTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kalıp seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Varsayılan mesaj</SelectItem>
                    {feedbackTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBulkRejectOpen(false)} disabled={bulkRejectLoading}>
                İptal
              </Button>
              <Button variant="destructive" onClick={submitBulkReject} disabled={bulkRejectLoading}>
                {bulkRejectLoading ? "İşleniyor..." : "Tümünü reddet"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
