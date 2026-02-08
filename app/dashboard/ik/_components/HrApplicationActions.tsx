"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { APPLICATION_FEEDBACK_TEMPLATES } from "@/lib/feedback-templates"

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
  const supabase = createClient()
  const [status, setStatus] = useState<string>(initialStatus || "pending")
  const [loading, setLoading] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackVisibleToDev, setFeedbackVisibleToDev] = useState(true)
  const [interviewOpen, setInterviewOpen] = useState(false)
  const [interviewDate, setInterviewDate] = useState("")
  const [interviewTimes, setInterviewTimes] = useState(["", "", ""])
  const [interviewType, setInterviewType] = useState<"video" | "phone" | "onsite">("video")
  const [interviewLink, setInterviewLink] = useState("")
  const [interviewLocation, setInterviewLocation] = useState("")
  const [interviewNote, setInterviewNote] = useState("")

  const startStatusChange = (value: string) => {
    if (value === status) return

    if (value === "interview") {
      setPendingStatus(value)
      setFeedbackText("")
      setInterviewOpen(true)
      return
    }

    // Red / kabul durumlarında geri bildirim iste
    if (value === "rejected" || value === "accepted") {
      setPendingStatus(value)
      setFeedbackOpen(true)
    } else {
      void updateStatus(value)
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
    interviewPayload?: {
      date: string
      timeOptions: string[]
      type: "video" | "phone" | "onsite"
      link?: string
      location?: string
      note?: string
    },
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

      if (interviewPayload) {
        const { error: interviewNoteError } = await supabase.from("application_notes").insert({
          application_id: applicationId,
          created_by: user.id,
          note_type: "interview",
          title: "Görüşme Daveti",
          content: JSON.stringify(interviewPayload),
          is_visible_to_developer: true,
        })

        if (interviewNoteError) {
          console.error(interviewNoteError)
          toast.warning("Görüşme detayları kaydedilemedi")
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
          title: "Görüşme daveti gönderildi",
          body: `${jobTitle} pozisyonu için görüşme daveti aldınız. Tarih ve saat seçeneklerini inceleyin.`,
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
          type: newStatus === "interview" ? "interview_invitation" : "application_status_changed",
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

  const handleInterviewSubmit = async () => {
    if (!pendingStatus) return
    const trimmedTimes = interviewTimes.map((t) => t.trim()).filter(Boolean)
    if (!interviewDate || trimmedTimes.length === 0) {
      toast.error("Görüşme tarihi ve en az bir saat seçeneği girin")
      return
    }

    await updateStatus(
      pendingStatus,
      feedbackText.trim()
        ? {
            content: feedbackText.trim(),
            visibleToDev: feedbackVisibleToDev,
          }
        : undefined,
      {
        date: interviewDate,
        timeOptions: trimmedTimes,
        type: interviewType,
        link: interviewLink.trim() || undefined,
        location: interviewLocation.trim() || undefined,
        note: interviewNote.trim() || undefined,
      },
    )

    setFeedbackText("")
    setFeedbackVisibleToDev(true)
    setInterviewDate("")
    setInterviewTimes(["", "", ""])
    setInterviewType("video")
    setInterviewLink("")
    setInterviewLocation("")
    setInterviewNote("")
    setPendingStatus(null)
    setInterviewOpen(false)
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

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Geri bildirim yaz</DialogTitle>
            <DialogDescription>
              Adaya iletmek istediğiniz kısa bir mesaj yazabilirsiniz. İsterseniz bu mesajı adayın görmesini de
              sağlayabilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Hazır mesaj</Label>
              <Select
                onValueChange={(value) => {
                  const template = APPLICATION_FEEDBACK_TEMPLATES.find((item) => item.value === value)
                  if (template) setFeedbackText(template.value)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Bir kalıp seçin" />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_FEEDBACK_TEMPLATES.map((template) => (
                    <SelectItem key={template.label} value={template.value}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Mesaj</Label>
              <Textarea
                id="feedback"
                placeholder="Örn: Pozisyona uygun olmadığınızı düşündük, ancak ilginiz için teşekkür ederiz."
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

      <Dialog open={interviewOpen} onOpenChange={setInterviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Görüşme daveti oluştur</DialogTitle>
            <DialogDescription>
              Görüşme tarihini ve adayın seçebileceği saat aralıklarını belirleyin. İsterseniz Meet linki veya konum
              ekleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="interviewDate">Tarih</Label>
                <Input
                  id="interviewDate"
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Görüşme türü</Label>
                <Select value={interviewType} onValueChange={(value) => setInterviewType(value as typeof interviewType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video (Meet)</SelectItem>
                    <SelectItem value="phone">Telefon</SelectItem>
                    <SelectItem value="onsite">Ofis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Saat seçenekleri</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {interviewTimes.map((time, index) => (
                  <Input
                    key={`time-${index}`}
                    type="time"
                    value={time}
                    onChange={(e) => {
                      const updated = [...interviewTimes]
                      updated[index] = e.target.value
                      setInterviewTimes(updated)
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewLink">Meet linki (opsiyonel)</Label>
              <Input
                id="interviewLink"
                type="url"
                placeholder="https://meet.google.com/..."
                value={interviewLink}
                onChange={(e) => setInterviewLink(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewLocation">Konum (opsiyonel)</Label>
              <Input
                id="interviewLocation"
                placeholder="Ofis adresi"
                value={interviewLocation}
                onChange={(e) => setInterviewLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewNote">Ek not (opsiyonel)</Label>
              <Textarea
                id="interviewNote"
                value={interviewNote}
                onChange={(e) => setInterviewNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setInterviewOpen(false)
                setPendingStatus(null)
              }}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="button" onClick={handleInterviewSubmit} disabled={loading}>
              Daveti gönder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
