"use client"

import { useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface InterviewPayload {
  date: string
  timeOptions: string[]
  type: "video" | "phone" | "onsite"
  link?: string
  location?: string
  note?: string
}

interface InterviewAvailabilityProps {
  applicationId: string
  jobTitle: string
  companyId: string | null
  interview: InterviewPayload
  existingResponse?: { selectedTime?: string; attending?: boolean; note?: string }
}

export function InterviewAvailability({
  applicationId,
  jobTitle,
  companyId,
  interview,
  existingResponse,
}: InterviewAvailabilityProps) {
  const supabase = createClient()
  const [selectedTime, setSelectedTime] = useState(existingResponse?.selectedTime ?? "")
  const [attending, setAttending] = useState(existingResponse?.attending ?? true)
  const [note, setNote] = useState(existingResponse?.note ?? "")
  const [loading, setLoading] = useState(false)

  const timeOptions = useMemo(() => interview.timeOptions ?? [], [interview.timeOptions])

  const handleSubmit = async () => {
    if (!selectedTime) {
      toast.error("Lütfen bir saat seçin")
      return
    }

    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Oturum bulunamadı")
        return
      }

      await supabase.from("application_notes").insert({
        application_id: applicationId,
        created_by: user.id,
        note_type: "interview_response",
        title: "Görüşme Katılımı",
        content: JSON.stringify({
          selectedTime,
          attending,
          note: note.trim() || undefined,
        }),
        is_visible_to_developer: false,
      })

      if (companyId) {
        const { data: recipients } = await supabase
          .from("profiles")
          .select("id")
          .eq("company_id", companyId)
          .in("role", ["hr", "company_admin"])

        if (recipients?.length) {
          await supabase.from("notifications").insert(
            recipients.map((recipient) => ({
              recipient_id: recipient.id,
              actor_id: user.id,
              type: "interview_response",
              title: "Görüşme saatini seçti",
              body: `${jobTitle} için görüşme saati ${selectedTime} olarak seçildi.`,
              href: "/dashboard/ik/basvurular",
              data: {
                application_id: applicationId,
                selected_time: selectedTime,
                attending,
                job_title: jobTitle,
              },
            })),
          )
        }
      }

      toast.success("Görüşme tercihlerin iletildi")
    } catch (err) {
      console.error(err)
      toast.error("Görüşme tercihleri gönderilemedi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-muted/30 p-4">
      <div className="text-sm font-medium text-foreground">Görüşme Daveti</div>
      <div className="text-xs text-muted-foreground">
        {interview.date} • {interview.type === "video" ? "Video" : interview.type === "phone" ? "Telefon" : "Ofis"}
      </div>
      {interview.link && (
        <div className="text-xs text-muted-foreground">
          Meet Linki:{" "}
          <a href={interview.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {interview.link}
          </a>
        </div>
      )}
      {interview.location && <div className="text-xs text-muted-foreground">Konum: {interview.location}</div>}
      {interview.note && <div className="text-xs text-muted-foreground">Not: {interview.note}</div>}

      <div className="space-y-2">
        <Label>Saat seçimi</Label>
        <Select value={selectedTime} onValueChange={setSelectedTime}>
          <SelectTrigger>
            <SelectValue placeholder="Saat seçin" />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <Label className="text-sm">Katılacağım</Label>
        <button
          type="button"
          onClick={() => setAttending((prev) => !prev)}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            attending ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {attending ? "Evet" : "Hayır"}
        </button>
      </div>

      <div className="space-y-2">
        <Label>Ek not (opsiyonel)</Label>
        <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={handleSubmit} disabled={loading}>
          Gönder
        </Button>
      </div>
    </div>
  )
}
