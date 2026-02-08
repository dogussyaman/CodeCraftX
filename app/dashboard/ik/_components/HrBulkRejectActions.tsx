"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { APPLICATION_FEEDBACK_TEMPLATES } from "@/lib/feedback-templates"

interface BulkRejectApplication {
  id: string
  developerId: string
  jobTitle: string
}

interface HrBulkRejectActionsProps {
  applications: BulkRejectApplication[]
}

export function HrBulkRejectActions({ applications }: HrBulkRejectActionsProps) {
  const supabase = createClient()
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleReject = async () => {
    if (applications.length === 0) return
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Oturum bulunamadı")
        return
      }

      await Promise.all(
        applications.map(async (application) => {
          const { error: statusError } = await supabase
            .from("applications")
            .update({ status: "rejected" })
            .eq("id", application.id)

          if (statusError) {
            console.error(statusError)
            return
          }

          await supabase.from("application_status_history").insert({
            application_id: application.id,
            old_status: "pending",
            new_status: "rejected",
            changed_by: user.id,
            changed_reason: "bulk_reject",
            notes: message.trim() || null,
          })

          if (message.trim()) {
            await supabase.from("application_notes").insert({
              application_id: application.id,
              created_by: user.id,
              note_type: "general",
              title: "Toplu Ret Mesajı",
              content: message.trim(),
              is_visible_to_developer: true,
            })
          }

          await supabase.from("notifications").insert({
            recipient_id: application.developerId,
            actor_id: user.id,
            type: "application_status_changed",
            title: "Başvurunuz reddedildi",
            body: `${application.jobTitle} pozisyonu için başvurunuz reddedildi.`,
            href: "/dashboard/gelistirici/basvurular",
            data: {
              application_id: application.id,
              new_status: "rejected",
              job_title: application.jobTitle,
            },
          })
        }),
      )

      toast.success("Toplu ret işlemi tamamlandı")
    } catch (err) {
      console.error(err)
      toast.error("Toplu ret sırasında hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
      <div className="text-sm font-medium text-foreground">
        {applications.length ? applications.length : 0} aday için toplu işlem
      </div>
      <Select
        onValueChange={(value) => {
          const template = APPLICATION_FEEDBACK_TEMPLATES.find((item) => item.value === value)
          if (template) setMessage(template.value)
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Hazır mesaj seçin" />
        </SelectTrigger>
        <SelectContent>
          {APPLICATION_FEEDBACK_TEMPLATES.map((template) => (
            <SelectItem key={template.label} value={template.value}>
              {template.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Toplu ret mesajı (opsiyonel)"
        rows={3}
      />
      <Button type="button" onClick={handleReject} disabled={loading || applications.length === 0}>
        {applications.length} adayı reddet
      </Button>
    </div>
  )
}
