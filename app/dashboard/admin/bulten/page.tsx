"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Plus, Send, Calendar } from "lucide-react"

type Campaign = {
  id: string
  title: string
  image_url: string | null
  body_html: string | null
  links: unknown
  created_at: string
  sent_at: string | null
}

export default function AdminBultenPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("newsletter_campaigns")
      .select("id, title, image_url, body_html, links, created_at, sent_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setCampaigns(data as Campaign[])
        setLoading(false)
      })
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Mail className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bülten</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kampanya oluşturun ve abonelere e-posta gönderin.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/bulten/olustur">
            <Plus className="size-4 mr-2" />
            Yeni bülten
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle>Kampanyalar</CardTitle>
          <CardDescription>
            Taslakları kaydedin, gönder butonu ile abonelere mail atın. E-posta taslağı: başlık + resim + detay + linkler.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Yükleniyor...</p>
          ) : campaigns.length === 0 ? (
            <p className="text-muted-foreground text-sm">Henüz kampanya yok. &quot;Yeni bülten&quot; ile oluşturun.</p>
          ) : (
            <ul className="space-y-3">
              {campaigns.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/admin/bulten/${c.id}`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="size-3" />
                        {new Date(c.created_at).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    {c.sent_at ? (
                      <Badge variant="secondary" className="shrink-0 flex items-center gap-1">
                        <Send className="size-3" />
                        Gönderildi
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">Taslak</Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
