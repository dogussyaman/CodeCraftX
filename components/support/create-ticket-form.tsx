"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { CheckCircle2, AlertCircle, Send, ImagePlus, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { supportTicketFormSchema, type SupportTicketFormValues } from "@/lib/validations"

const BUCKET = "support-tickets"
const MAX_FILES = 5
const MAX_SIZE_MB = 5
const ACCEPT = "image/jpeg,image/png,image/gif,image/webp"

const typeOptions = [
  { value: "login_error", label: "Giriş hatası" },
  { value: "feedback", label: "Geri bildirim" },
  { value: "technical", label: "Teknik" },
  { value: "other", label: "Diğer" },
] as const

const priorityOptions = [
  { value: "low", label: "Düşük" },
  { value: "medium", label: "Orta" },
  { value: "high", label: "Yüksek" },
  { value: "urgent", label: "Acil" },
] as const

interface CreateTicketFormProps {
  /** Giriş yapmış kullanıcı; varsa email oturumdan doldurulur ve user_id gönderilir */
  user?: { id: string; email?: string } | null
  /** Başarı sonrası yönlendirilecek sayfa (örn. /dashboard/gelistirici/destek) */
  ticketsPageHref?: string
}

export function CreateTicketForm({ user, ticketsPageHref }: CreateTicketFormProps) {
  const router = useRouter()
  const isLoggedIn = !!user?.id
  const defaultEmail = user?.email ?? ""
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupportTicketFormValues>({
    resolver: zodResolver(supportTicketFormSchema),
    defaultValues: {
      email: defaultEmail,
      type: undefined,
      subject: "",
      description: "",
      priority: "medium",
    },
  })

  useEffect(() => {
    if (isLoggedIn && defaultEmail) {
      setValue("email", defaultEmail)
    }
  }, [isLoggedIn, defaultEmail, setValue])

  const uploadAttachments = async (supabase: ReturnType<typeof createClient>): Promise<string[]> => {
    if (!attachmentFiles.length) return []
    const prefix = isLoggedIn && user?.id
      ? `${user.id}/${crypto.randomUUID()}`
      : `anon/${crypto.randomUUID()}`
    const urls: string[] = []
    for (let i = 0; i < attachmentFiles.length; i++) {
      const file = attachmentFiles[i]
      const ext = file.name.split(".").pop() || "jpg"
      const path = `${prefix}/${i}.${ext}`
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      })
      if (error) {
        if (error.message?.includes("Bucket not found") || error.message?.includes("404")) {
          throw new Error(
            "Destek ekleri için depolama alanı henüz oluşturulmamış. Yönetici Supabase SQL Editor'da 066_support_tickets_rls.sql scriptini çalıştırmalı veya Storage'da 'support-tickets' bucket'ını oluşturmalı.",
          )
        }
        throw error
      }
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      urls.push(data.publicUrl)
    }
    return urls
  }

  const onSubmit = async (data: SupportTicketFormValues) => {
    const email = (data.email ?? "").trim()
    if (!email && !isLoggedIn) {
      toast.error("E-posta gereklidir.", { icon: <AlertCircle className="h-5 w-5" /> })
      return
    }

    try {
      const supabase = createClient()
      const attachment_urls = await uploadAttachments(supabase)
      const { data: ticket, error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: isLoggedIn ? user!.id : null,
          email: isLoggedIn ? (user!.email ?? email) : email,
          type: data.type,
          subject: data.subject,
          description: data.description,
          status: "open",
          priority: data.priority,
          attachment_urls: attachment_urls,
        })
        .select("id")
        .single()

      if (error) throw error

      // Admin'e yeni destek talebi emaili gönder
      if (ticket?.id) {
        void fetch("/api/email/new-support-ticket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketId: ticket.id }),
        }).catch((err) => {
          console.error("New support ticket email trigger failed", err)
        })
      }

      toast.success("Destek talebiniz alındı.", {
        description: "En kısa sürede size dönüş yapacağız.",
        icon: <CheckCircle2 className="h-5 w-5" />,
      })
      reset({
        email: isLoggedIn ? defaultEmail : "",
        type: undefined,
        subject: "",
        description: "",
        priority: "medium",
      })
      setAttachmentFiles([])
      if (ticketsPageHref) router.push(ticketsPageHref)
    } catch (err: unknown) {
      console.error("Support ticket error:", err)
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Talep gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
      toast.error("Hata", {
        description: message,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!isLoggedIn && (
        <div className="space-y-2">
          <Label htmlFor="email">
            E-posta <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="email@example.com"
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      )}
      {isLoggedIn && (
        <div className="space-y-2">
          <Label>E-posta</Label>
          <Input type="email" value={defaultEmail} readOnly className="bg-muted" />
        </div>
      )}

      <div className="space-y-2">
        <Label>Talep türü <span className="text-destructive">*</span></Label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                <SelectValue placeholder="Tür seçin" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">
          Konu <span className="text-destructive">*</span>
        </Label>
        <Input
          id="subject"
          {...register("subject")}
          placeholder="Kısa bir konu yazın"
          className={errors.subject ? "border-destructive" : ""}
        />
        {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Açıklama <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Sorununuzu veya talebinizi detaylı yazın..."
          rows={5}
          className={errors.description ? "border-destructive" : ""}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Öncelik <span className="text-destructive">*</span></Label>
        <Controller
          name="priority"
          control={control}
          defaultValue="medium"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className={errors.priority ? "border-destructive" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.priority && <p className="text-sm text-destructive">{errors.priority.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Ek resimler (isteğe bağlı)</Label>
        <p className="text-xs text-muted-foreground">
          En fazla {MAX_FILES} resim, her biri {MAX_SIZE_MB} MB. JPG, PNG, GIF, WebP.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="file"
            accept={ACCEPT}
            multiple
            className="max-w-[200px]"
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              const valid = files.filter((f) => f.size <= MAX_SIZE_MB * 1024 * 1024).slice(0, MAX_FILES)
              if (valid.length < files.length) {
                toast.error(`Sadece ${MAX_FILES} adet, her biri ${MAX_SIZE_MB} MB altı kabul edilir.`)
              }
              setAttachmentFiles((prev) => [...prev, ...valid].slice(0, MAX_FILES))
              e.target.value = ""
            }}
          />
          {attachmentFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachmentFiles.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
                >
                  <ImagePlus className="h-4 w-4" />
                  {f.name}
                  <button
                    type="button"
                    onClick={() => setAttachmentFiles((p) => p.filter((_, j) => j !== i))}
                    className="rounded p-0.5 hover:bg-muted-foreground/20"
                    aria-label="Kaldır"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? (
          "Gönderiliyor..."
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Talebi Gönder
          </>
        )}
      </Button>
    </form>
  )
}
