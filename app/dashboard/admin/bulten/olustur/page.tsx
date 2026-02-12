"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { sanitizeHtml } from "@/lib/sanitize"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

type LinkItem = { text: string; url: string }

export default function AdminBultenOlusturPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [bodyHtml, setBodyHtml] = useState("")
  const [links, setLinks] = useState<LinkItem[]>([{ text: "", url: "" }])

  const addLink = () => setLinks((prev) => [...prev, { text: "", url: "" }])
  const removeLink = (i: number) => setLinks((prev) => prev.filter((_, idx) => idx !== i))
  const updateLink = (i: number, field: "text" | "url", value: string) => {
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)))
  }

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error("Başlık gerekli")
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const linksFiltered = links.filter((l) => l.text.trim() && l.url.trim())
    const { data, error } = await supabase
      .from("newsletter_campaigns")
      .insert({
        title: title.trim(),
        image_url: imageUrl.trim() || null,
        body_html: bodyHtml.trim() || null,
        links: linksFiltered.length ? linksFiltered : [],
        created_by: user?.id ?? null,
      })
      .select("id")
      .single()
    setSaving(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Taslak kaydedildi")
    router.push(`/dashboard/admin/bulten/${data.id}`)
  }

  const previewLinks = links.filter((l) => l.text.trim() || l.url.trim())
  const hasPreviewContent = title.trim() || imageUrl.trim() || bodyHtml.trim() || previewLinks.length > 0

  return (
    <div className="container mx-auto p-6 max-w-2xl min-h-screen space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-lg">
          <Link href="/dashboard/admin/bulten">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Yeni bülten</h1>
          <CardDescription>Başlık, resim, detay ve linkler. Kaydedin; gönderimi kampanya sayfasından yapın.</CardDescription>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kampanya içeriği</CardTitle>
          <CardDescription>
            E-posta taslağı: başlık + resim + detay + linkler olarak abonelere gidecek.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              placeholder="Bülten başlığı"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image_url">Resim URL</Label>
            <Input
              id="image_url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body_html">Detay (HTML veya düz metin)</Label>
            <Textarea
              id="body_html"
              placeholder="İçerik..."
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              rows={8}
              className="rounded-lg font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Linkler</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLink} className="rounded-lg">
                <Plus className="size-4 mr-1" />
                Ekle
              </Button>
            </div>
            <div className="space-y-2">
              {links.map((link, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    placeholder="Metin"
                    value={link.text}
                    onChange={(e) => updateLink(i, "text", e.target.value)}
                    className="rounded-lg flex-1"
                  />
                  <Input
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => updateLink(i, "url", e.target.value)}
                    className="rounded-lg flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLink(i)}
                    className="shrink-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSaveDraft} disabled={saving} className="rounded-lg">
              {saving ? "Kaydediliyor..." : "Taslak kaydet"}
            </Button>
            <Button variant="outline" asChild className="rounded-lg">
              <Link href="/dashboard/admin/bulten">İptal</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasPreviewContent && (
        <Card>
          <CardHeader>
            <CardTitle>E-posta önizleme</CardTitle>
            <CardDescription>
              Seçtiğin başlık, resim, detay ve linkler abonelere bu şekilde görünecek.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {title.trim() && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Başlık</p>
                <p className="font-medium">{title}</p>
              </div>
            )}

            {imageUrl.trim() && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Resim</p>
                <img
                  src={imageUrl}
                  alt=""
                  className="rounded-lg border border-border max-h-48 object-cover"
                />
              </div>
            )}

            {bodyHtml.trim() && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Detay</p>
                <div
                  className="rounded-lg border border-border p-4 bg-muted/30 text-sm prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(bodyHtml) }}
                />
              </div>
            )}

            {previewLinks.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Linkler</p>
                <ul className="space-y-1">
                  {previewLinks.map((link, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">•</span>
                      <a
                        href={link.url}
                        className="text-primary hover:underline break-all"
                        target="_blank"
                        rel="noopener noreferrer"
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
      )}
    </div>
  )
}
