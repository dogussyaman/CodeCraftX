"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

type TopicRow = { id: string; slug: string; label: string; sort_order: number }

export function CommunityTopicsManager({ initialTopics }: { initialTopics: TopicRow[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [topics, setTopics] = useState(initialTopics)
  const [slug, setSlug] = useState("")
  const [label, setLabel] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const s = slug.trim().toLowerCase().replace(/\s+/g, "-")
    const l = label.trim()
    if (!s || !l) {
      toast({ title: "Hata", description: "Slug ve etiket gerekli.", variant: "destructive" })
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("community_topics")
      .insert({ slug: s, label: l, sort_order: topics.length })
      .select("id, slug, label, sort_order")
      .single()
    setLoading(false)
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Hata", description: "Bu slug zaten var.", variant: "destructive" })
      } else {
        toast({ title: "Hata", description: "Konu eklenemedi.", variant: "destructive" })
      }
      return
    }
    setTopics((prev) => [...prev, data as TopicRow])
    setSlug("")
    setLabel("")
    router.refresh()
    toast({ title: "Başarılı", description: "Konu eklendi." })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="topic-slug">Slug</Label>
          <Input
            id="topic-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ornek-konu"
            className="w-40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="topic-label">Etiket</Label>
          <Input
            id="topic-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Örnek Konu"
            className="w-40"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Ekleniyor..." : "Konu ekle"}
        </Button>
      </form>
      {topics.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Henüz konu yok. Yukarıdan ekleyin.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Slug</TableHead>
              <TableHead>Etiket</TableHead>
              <TableHead>Sıra</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-sm">{t.slug}</TableCell>
                <TableCell>{t.label}</TableCell>
                <TableCell className="text-muted-foreground">{t.sort_order}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
