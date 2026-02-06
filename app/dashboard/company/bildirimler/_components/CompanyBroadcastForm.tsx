"use client"

import { useState } from "react"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface CompanyBroadcastFormProps {
  companyId: string
}

export function CompanyBroadcastForm({ companyId }: CompanyBroadcastFormProps) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [href, setHref] = useState("")
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
      const { data, error } = await supabase.rpc("broadcast_notification_to_company", {
        p_company_id: companyId,
        p_title: title.trim(),
        p_body: body.trim() || null,
        p_href: href.trim() || null,
      })

      if (error) throw error

      toast({
        title: "Gönderildi",
        description: `${data} kişiye bildirim iletildi.`,
      })
      setTitle("")
      setBody("")
      setHref("")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Bildirim gönderilemedi"
      toast({
        title: "Hata",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Şirket içi bildirim gönder</CardTitle>
        <CardDescription>
          Sadece kendi şirketinizdeki kullanıcılara (çalışanlar, İK) in-app bildirim iletir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-title">Başlık *</Label>
            <Input
              id="company-title"
              placeholder="Örn: Yeni iç politika yayınlandı"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-body">İçerik</Label>
            <Textarea
              id="company-body"
              placeholder="Kısa açıklama..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-href">Link (opsiyonel)</Label>
            <Input
              id="company-href"
              placeholder="/dashboard/company/ilanlar"
              value={href}
              onChange={(e) => setHref(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="mr-2 size-4" />
                Gönder
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
