"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { ExternalLink, CheckCircle2 } from "lucide-react"

interface DeveloperInterviewConfirmProps {
  interviewId: string
  meetLink: string | null
  proposedDate: string | null
  proposedTimeSlots: string[]
  developerConfirmedAt: string | null
  developerSelectedSlot: string | null
}

export function DeveloperInterviewConfirm({
  interviewId,
  meetLink,
  proposedDate,
  proposedTimeSlots,
  developerConfirmedAt,
  developerSelectedSlot,
}: DeveloperInterviewConfirmProps) {
  const [loading, setLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string>(developerSelectedSlot || "")
  const confirmed = !!developerConfirmedAt

  const handleConfirm = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/applications/interview-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          selectedSlot: proposedTimeSlots.length > 0 ? selectedSlot || undefined : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || "Onay gönderilemedi")
        setLoading(false)
        return
      }
      toast.success("Katılım onayınız iletildi")
      window.location.reload()
    } catch (e) {
      console.error(e)
      toast.error("İşlem başarısız")
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <div className="pt-2 border-t border-border/40 text-sm space-y-1">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
          <CheckCircle2 className="size-4" />
          Katılım onayı gönderildi
          {developerSelectedSlot && ` — ${developerSelectedSlot}`}
          {proposedDate && ` (${proposedDate})`}
        </div>
        {meetLink && (
          <a
            href={meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <ExternalLink className="size-3" />
            Toplantı linki
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="pt-2 border-t border-border/40 space-y-3">
      <div className="font-medium text-foreground">Görüşme daveti</div>
      {meetLink && (
        <a
          href={meetLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
        >
          <ExternalLink className="size-3" />
          Meet / toplantı linki
        </a>
      )}
      {proposedDate && (
        <p className="text-sm text-muted-foreground">
          Tarih: {new Date(proposedDate + "T12:00:00").toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      )}
      {proposedTimeSlots.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs">Uygun saati seçin</Label>
          <Select value={selectedSlot} onValueChange={setSelectedSlot}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Saat seçin" />
            </SelectTrigger>
            <SelectContent>
              {proposedTimeSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <Button size="sm" onClick={handleConfirm} disabled={loading}>
        {loading ? "Gönderiliyor..." : "Katılacağım — Gönder"}
      </Button>
    </div>
  )
}
