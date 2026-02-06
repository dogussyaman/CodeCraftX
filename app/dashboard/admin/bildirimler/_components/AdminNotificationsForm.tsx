"use client"

import { useState } from "react"
import { Loader2, Send, Eye } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export function AdminNotificationsForm() {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [href, setHref] = useState("")
  const [targetRole, setTargetRole] = useState("all")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

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

      toast({
        title: "Başarılı",
        description: `${data} kullanıcıya bildirim gönderildi`,
      })

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

  const previewBody = body.trim()
    ? body.trim().split(/\n/)[0].slice(0, 120) + (body.trim().length > 120 ? "…" : "")
    : ""

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Yeni Bildirim (In-App)</CardTitle>
        <CardDescription>
          Başlık ve isteğe bağlı içerik/link ile, seçtiğiniz role giden in-app bildirim oluşturun.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              placeholder="Örn: Yeni İş İlanı Eklendi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">İçerik</Label>
            <Textarea
              id="body"
              placeholder="Bildirim detayları..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="href">Link (Opsiyonel)</Label>
            <Input
              id="href"
              placeholder="/is-ilanlari"
              value={href}
              onChange={(e) => setHref(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Kullanıcılar bildirime tıkladığında yönlendirilecek sayfa
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Hedef Kitle *</Label>
            <Select value={targetRole} onValueChange={setTargetRole}>
              <SelectTrigger id="target">
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

          {(title.trim() || previewBody || href.trim()) && (
            <Card className="bg-muted/30 border-border">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="size-4 text-muted-foreground" />
                  Önizleme
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2 text-sm">
                {title.trim() && (
                  <p className="font-medium text-foreground">{title.trim()}</p>
                )}
                {previewBody && (
                  <p className="text-muted-foreground line-clamp-2">{previewBody}</p>
                )}
                {href.trim() && (
                  <p className="text-xs text-muted-foreground">Link: {href.trim()}</p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
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
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
