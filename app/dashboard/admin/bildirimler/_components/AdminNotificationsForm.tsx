"use client"

import { useState, useEffect } from "react"
import {
  Loader2,
  Send,
  Type,
  FileText,
  Link as LinkIcon,
  Users,
  Eye,
  X,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { getNotificationTypeMeta, getNotificationCtaText } from "@/lib/notifications"
import { ChevronRight } from "lucide-react"
import type { NotificationTemplateValues } from "../page"

const TITLE_MAX_LENGTH = 100
const BODY_MAX_LENGTH = 500

const TARGET_ROLE_LABELS: Record<string, string> = {
  all: "Tüm Kullanıcılar",
  developer: "Geliştiriciler",
  hr: "İK Uzmanları",
  company_admin: "Şirket Yöneticileri",
  admin: "Adminler",
}

interface AdminNotificationsFormProps {
  initialValues?: NotificationTemplateValues | null
  applyTrigger?: number
}

export function AdminNotificationsForm({
  initialValues,
  applyTrigger = 0,
}: AdminNotificationsFormProps) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [href, setHref] = useState("")
  const [targetRole, setTargetRole] = useState("all")
  const [loading, setLoading] = useState(false)
  const [lastSuccess, setLastSuccess] = useState<{ count: number; role: string } | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    if (applyTrigger > 0 && initialValues) {
      setTitle(initialValues.title)
      setBody(initialValues.body)
      setHref(initialValues.href)
      setTargetRole(initialValues.targetRole)
    }
  }, [applyTrigger, initialValues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Hata",
        description: "Başlık zorunludur.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.rpc("broadcast_notification", {
        p_title: title.trim(),
        p_body: body.trim() || null,
        p_href: href.trim() || null,
        p_target_role: targetRole,
        p_data: {},
      })

      if (error) throw error

      const count = typeof data === "number" ? data : 0
      setLastSuccess({ count, role: targetRole })
      toast({
        title: "Başarılı",
        description: `${data} kullanıcıya bildirim gönderildi`,
      })
      setTimeout(() => setLastSuccess(null), 6000)

      setTitle("")
      setBody("")
      setHref("")
      setTargetRole("all")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bildirim gönderilemedi"
      console.error("Bildirim gönderme hatası:", err)
      toast({
        title: "Hata",
        description: `Bildirim gönderilemedi: ${message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const { icon: PreviewIcon, label: typeLabel } = getNotificationTypeMeta("system")
  const ctaText = href.trim() ? getNotificationCtaText("system") : null
  const showPreview = title.trim() || body.trim() || href.trim()
  const hasContent = title.trim() || body.trim() || href.trim() || targetRole !== "all"

  const handleClearSelection = () => {
    setTitle("")
    setBody("")
    setHref("")
    setTargetRole("all")
  }

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle>Yeni Bildirim (In-App)</CardTitle>
        <CardDescription>
          Başlık ve isteğe bağlı içerik/link ile, seçtiğiniz role giden in-app bildirim oluşturun.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {lastSuccess && (
          <Alert variant="success" className="[&_svg]:text-success">
            <CheckCircle2 className="size-4" />
            <AlertDescription>
              <span className="font-medium">{lastSuccess.count}</span> kullanıcıya bildirim iletildi
              {lastSuccess.role !== "all" && (
                <> — hedef: <span className="font-medium">{TARGET_ROLE_LABELS[lastSuccess.role] ?? lastSuccess.role}</span></>
              )}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">İçerik</h3>
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2 text-foreground">
                <Type className="size-4 text-muted-foreground" />
                Başlık *
              </Label>
              <Input
                id="title"
                placeholder="Örn: Yeni İş İlanı Eklendi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={TITLE_MAX_LENGTH}
                required
                className="bg-background focus-visible:ring-2"
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/{TITLE_MAX_LENGTH} karakter
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body" className="flex items-center gap-2 text-foreground">
                <FileText className="size-4 text-muted-foreground" />
                İçerik (opsiyonel)
              </Label>
              <Textarea
                id="body"
                placeholder="Bildirim detayları..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={BODY_MAX_LENGTH}
                className="resize-none bg-background focus-visible:ring-2"
              />
              <p className="text-xs text-muted-foreground">
                {body.length}/{BODY_MAX_LENGTH} karakter
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="href" className="flex items-center gap-2 text-foreground">
                <LinkIcon className="size-4 text-muted-foreground" />
                Yönlendirme linki (opsiyonel)
              </Label>
              <Input
                id="href"
                placeholder="/is-ilanlari"
                value={href}
                onChange={(e) => setHref(e.target.value)}
                className="bg-background focus-visible:ring-2"
              />
              <p className="text-xs text-muted-foreground">
                Boş bırakılırsa bildirime tıklanınca yönlendirme yapılmaz.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Hedef Kitle</h3>
            <div className="space-y-2">
              <Label htmlFor="target" className="flex items-center gap-2 text-foreground">
                <Users className="size-4 text-muted-foreground" />
                Hedef Kitle *
              </Label>
              <Select value={targetRole} onValueChange={setTargetRole}>
                <SelectTrigger id="target" className="bg-background focus:ring-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                  <SelectItem value="developer">Sadece Geliştiriciler</SelectItem>
                  <SelectItem value="hr">Sadece İK Uzmanları</SelectItem>
                  <SelectItem value="company_admin">Şirket Yöneticisi</SelectItem>
                  <SelectItem value="admin">Sadece Adminler</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          {showPreview && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2 flex items-center gap-2">
                <Eye className="size-4 text-muted-foreground" />
                Önizleme
              </h3>
              <p className="text-xs text-muted-foreground">Kullanıcının bildirim merkezinde göreceği görünüm</p>
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm max-w-md">
                <div className="flex gap-3 rounded-lg border border-border bg-primary/5 p-3 shadow-inner">
                  <div className="shrink-0 mt-0.5">
                    <PreviewIcon className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {title.trim() || "Başlık"}
                      </p>
                      <div className="size-2 shrink-0 rounded-full bg-primary mt-1.5" aria-hidden />
                    </div>
                    {body.trim() ? (
                      <p className="text-sm text-muted-foreground line-clamp-2">{body.trim()}</p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-normal text-muted-foreground border-border"
                      >
                        {typeLabel}
                      </Badge>
                      <span className="text-muted-foreground">Şimdi</span>
                    </div>
                    {ctaText && href.trim() ? (
                      <div className="flex items-center gap-1 text-xs text-primary pt-0.5">
                        <span className="font-medium">{ctaText}</span>
                        <ChevronRight className="size-3.5" />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          )}

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
            <Button type="submit" disabled={loading} className="flex-1 sm:flex-initial">
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="mr-2 size-4" />
                  Bildirim Gönder
                </>
              )}
            </Button>
            {hasContent && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearSelection}
                disabled={loading}
                className="gap-2"
              >
                <X className="size-4" />
                Seçimi iptal et
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
