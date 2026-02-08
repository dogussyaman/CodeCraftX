"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const STATUS_OPTIONS = [
  { value: "pending", label: "Bekliyor" },
  { value: "reviewed", label: "İncelendi" },
  { value: "interview", label: "Görüşme" },
  { value: "rejected", label: "Reddedildi" },
  { value: "accepted", label: "Kabul Edildi" },
]

interface HrApplicationActionsProps {
  applicationId: string
  initialStatus: string
  developerId: string
  jobTitle: string
}

export function HrApplicationActions({
  applicationId,
  initialStatus,
  developerId,
  jobTitle,
}: HrApplicationActionsProps) {
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current
  const [status, setStatus] = useState<string>(initialStatus || "pending")
  const [loading, setLoading] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [interviewModalOpen, setInterviewModalOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackVisibleToDev, setFeedbackVisibleToDev] = useState(true)
  const [meetLink, setMeetLink] = useState("")
  const [proposedDate, setProposedDate] = useState("")
  const [proposedTimeSlotsStr, setProposedTimeSlotsStr] = useState("")
  const [feedbackTemplates, setFeedbackTemplates] = useState<{ id: string; title: string; body: string; type: string }[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("__none__")

  useEffect(() => {
    if (!feedbackOpen) return
    const load = async () => {
      const { data } = await supabaseRef.current
        .from("feedback_templates")
        .select("id, title, body, type")
        .order("type")
      setFeedbackTemplates((data as { id: string; title: string; body: string; type: string }[]) || [])
      setSelectedTemplateId("__none__")
      setFeedbackText("")
    }
    void load()
  }, [feedbackOpen])

  const onTemplateChange = (id: string) => {
    setSelectedTemplateId(id)
    if (id === "__none__") {
      setFeedbackText("")
      return
    }
    const t = feedbackTemplates.find((x) => x.id === id)
    if (t) setFeedbackText(t.body)
  }

  const startStatusChange = (value: string) => {
    if (value === status) return

    if (value === "interview") {
      setPendingStatus("interview")
      setInterviewModalOpen(true)
    } else if (value === "rejected" || value === "accepted") {
      setPendingStatus(value)
      setFeedbackOpen(true)
    } else {
      void updateStatus(value)
    }
  }

  const handleInterviewInviteSubmit = async () => {
    if (!pendingStatus || pendingStatus !== "interview") return
    setLoading(true)
    try {
      const slots = proposedTimeSlotsStr
        .split(/[,;\s]+/)
        .map((s) => s.trim())
        .filter(Boolean)
      const res = await fetch("/api/applications/interview-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          meetLink: meetLink.trim() || undefined,
          proposedDate: proposedDate.trim() || undefined,
          proposedTimeSlots: slots.length > 0 ? slots : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || "Görüşme daveti gönderilemedi")
        setLoading(false)
        return
      }
      setStatus("interview")
      setInterviewModalOpen(false)
      setMeetLink("")
      setProposedDate("")
      setProposedTimeSlotsStr("")
      setPendingStatus(null)
      toast.success("Görüşme daveti gönderildi")
      void fetch("/api/email/application-status-changed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status: "interview" }),
      }).catch(() => {})
    } catch (e) {
      console.error(e)
      toast.error("İşlem başarısız")
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackSubmit = async () => {
    if (!pendingStatus) return
    await updateStatus(pendingStatus, {
      content: feedbackText.trim(),
      visibleToDev: feedbackVisibleToDev,
    })
    setFeedbackText("")
    setFeedbackVisibleToDev(true)
    setPendingStatus(null)
    setFeedbackOpen(false)
  }

  const updateStatus = async (
    newStatus: string,
    note?: { content: string; visibleToDev: boolean },
  ) => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Oturum bulunamadı")
        return
      }

      // 1) applications.status güncelle
      const { error: statusError } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", applicationId)

      if (statusError) {
        console.error(statusError)
        toast.error("Durum güncellenemedi")
        return
      }

      // 2) application_status_history kaydı
      const { error: historyError } = await supabase.from("application_status_history").insert({
        application_id: applicationId,
        old_status: status,
        new_status: newStatus,
        changed_by: user.id,
        changed_reason: null,
        notes: note?.content || null,
      })

      if (historyError) {
        console.error(historyError)
      }

      // 3) Opsiyonel görünür not
      if (note && note.content) {
        const { error: noteError } = await supabase.from("application_notes").insert({
          application_id: applicationId,
          created_by: user.id,
          note_type: "general",
          title: null,
          content: note.content,
          is_visible_to_developer: note.visibleToDev,
        })

        if (noteError) {
          console.error(noteError)
          toast.warning("Durum güncellendi, ancak geri bildirim notu kaydedilemedi")
        }
      }

      // 4) Geliştiriciye email bildirimi gönder
      void fetch("/api/email/application-status-changed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status: newStatus }),
      }).catch((err) => {
        console.error("Application status email trigger failed", err)
      })

      // 5) Geliştiriciye bildirim gönder
      const notificationMessages: Record<string, { title: string; body: string }> = {
        pending: {
          title: "Başvurunuz değerlendiriliyor",
          body: `${jobTitle} pozisyonu için başvurunuz değerlendirme aşamasına alındı.`,
        },
        reviewed: {
          title: "Başvurunuz incelendi",
          body: `${jobTitle} pozisyonu için başvurunuz incelendi.`,
        },
        interview: {
          title: "Görüşme talebi aldınız",
          body: `${jobTitle} pozisyonu için görüşme talebi aldınız. Detaylar için başvurularınız sayfasını kontrol edin.`,
        },
        rejected: {
          title: "Başvurunuz reddedildi",
          body: `${jobTitle} pozisyonu için başvurunuz reddedildi. Detaylar için başvurularınız sayfasını kontrol edin.`,
        },
        accepted: {
          title: "Tebrikler! Başvurunuz kabul edildi",
          body: `${jobTitle} pozisyonu için başvurunuz kabul edildi. Detaylar için başvurularınız sayfasını kontrol edin.`,
        },
      }

      const notification = notificationMessages[newStatus]
      if (notification) {
        const { error: notifError } = await supabase.from("notifications").insert({
          recipient_id: developerId,
          actor_id: user.id,
          type: "application_status_changed",
          title: notification.title,
          body: notification.body,
          href: "/dashboard/gelistirici/basvurular",
          data: {
            application_id: applicationId,
            new_status: newStatus,
            job_title: jobTitle,
          },
        })

        if (notifError) {
          console.error("Bildirim gönderme hatası:", notifError)
          // Bildirim hatası kritik değil, sadece log'la
        }
      }

      setStatus(newStatus)
      toast.success("Başvuru durumu güncellendi")
    } catch (err) {
      console.error(err)
      toast.error("Durum güncellenirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2 items-end">
        <Label className="text-xs text-muted-foreground">Başvuru Durumu</Label>
        <Select value={status} onValueChange={startStatusChange} disabled={loading}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog open={interviewModalOpen} onOpenChange={setInterviewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Görüşme daveti</DialogTitle>
            <DialogDescription>
              Meet linki girin veya tarih ve saat seçenekleri belirleyin. Aday uygun saati seçecek.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="meetLink">Meet / toplantı linki (opsiyonel)</Label>
              <Input
                id="meetLink"
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposedDate">Tarih (opsiyonel)</Label>
              <Input
                id="proposedDate"
                type="date"
                value={proposedDate}
                onChange={(e) => setProposedDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slots">Saat seçenekleri (virgülle ayırın, opsiyonel)</Label>
              <Input
                id="slots"
                placeholder="09:00, 10:00, 14:00"
                value={proposedTimeSlotsStr}
                onChange={(e) => setProposedTimeSlotsStr(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setInterviewModalOpen(false)
                  setPendingStatus(null)
                }}
                disabled={loading}
              >
                İptal
              </Button>
              <Button type="button" onClick={handleInterviewInviteSubmit} disabled={loading}>
                Davet gönder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Geri bildirim yaz</DialogTitle>
            <DialogDescription>
              Hazır kalıp seçebilir veya kendi mesajınızı yazabilirsiniz. Bu mesajı adayın görmesini sağlayabilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {feedbackTemplates.length > 0 && (
              <div className="space-y-2">
                <Label>Hazır kalıp (opsiyonel)</Label>
                <Select value={selectedTemplateId} onValueChange={onTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kalıp seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Özel mesaj yaz</SelectItem>
                    {feedbackTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="feedback">Mesaj</Label>
              <Textarea
                id="feedback"
                placeholder="Kalıp seçin veya kendi mesajınızı yazın..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="visibleToDev"
                checked={feedbackVisibleToDev}
                onCheckedChange={(checked) => setFeedbackVisibleToDev(Boolean(checked))}
              />
              <Label htmlFor="visibleToDev" className="text-sm font-normal cursor-pointer">
                Bu mesaj geliştiriciye görünsün
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFeedbackOpen(false)
                setPendingStatus(null)
                setFeedbackText("")
              }}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="button" onClick={handleFeedbackSubmit} disabled={loading}>
              Kaydet ve durumu güncelle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
