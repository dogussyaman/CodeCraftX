"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { sanitizeHtml } from "@/lib/sanitize"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Calendar, ExternalLink } from "lucide-react"
import { toast } from "sonner"

type Campaign = {
  id: string
  title: string
  image_url: string | null
  body_html: string | null
  links: { text: string; url: string }[]
  created_at: string
  sent_at: string | null
}

export default function AdminBultenDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("newsletter_campaigns")
      .select("id, title, image_url, body_html, links, created_at, sent_at")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setCampaign(null)
        } else {
          setCampaign({
            ...data,
            links: Array.isArray(data.links) ? data.links : [],
          } as Campaign)
        }
        setLoading(false)
      })
  }, [id])

  const handleSend = async () => {
    if (!campaign || campaign.sent_at) return
    setSending(true)
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaign_id: campaign.id }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json?.error ?? "Gönderim başarısız")
        setSending(false)
        return
      }
      toast.success("Bülten gönderildi")
      setCampaign((prev) => (prev ? { ...prev, sent_at: new Date().toISOString() } : null))
      router.refresh()
    } catch {
      toast.error("Bağlantı hatası")
    }
    setSending(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="container mx-auto p-6 max-w-2xl space-y-4">
        <p className="text-muted-foreground">Kampanya bulunamadı.</p>
        <Button asChild variant="outline" className="rounded-lg">
          <Link href="/dashboard/admin/bulten">Listeye dön</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl min-h-screen space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-lg">
            <Link href="/dashboard/admin/bulten">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold truncate max-w-[280px]">{campaign.title}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="size-3" />
              {new Date(campaign.created_at).toLocaleDateString("tr-TR")}
              {campaign.sent_at && (
                <>
                  {" · "}
                  Gönderildi: {new Date(campaign.sent_at).toLocaleDateString("tr-TR")}
                </>
              )}
            </p>
          </div>
        </div>
        {campaign.sent_at ? (
          <Badge variant="secondary" className="shrink-0">Gönderildi</Badge>
        ) : (
          <Button onClick={handleSend} disabled={sending} className="rounded-lg shrink-0">
            <Send className="size-4 mr-2" />
            {sending ? "Gönderiliyor..." : "Gönder"}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>E-posta taslağı</CardTitle>
          <CardDescription>
            Abonelere gidecek içerik: başlık + resim + detay + linkler.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Başlık</p>
            <p className="font-medium">{campaign.title}</p>
          </div>
          {campaign.image_url && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Resim</p>
              <img
                src={campaign.image_url}
                alt=""
                className="rounded-lg border border-border max-h-48 object-cover"
              />
            </div>
          )}
          {campaign.body_html && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Detay</p>
              <div
                className="rounded-lg border border-border p-4 bg-muted/30 text-sm prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(campaign.body_html ?? "") }}
              />
            </div>
          )}
          {campaign.links && campaign.links.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Linkler</p>
              <ul className="space-y-1">
                {campaign.links.map((link: { text: string; url: string }, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <ExternalLink className="size-3 text-muted-foreground" />
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      {link.text || link.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
