"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import type { Speaker } from "./event-form-types"

interface EventFormTabSpeakersProps {
  mode: "create" | "edit"
  speakers: Speaker[]
  addSpeaker: () => void
  removeSpeaker: (i: number) => void
  setSpeaker: (i: number, field: keyof Speaker, value: string | number) => void
}

export function EventFormTabSpeakers({
  mode,
  speakers,
  addSpeaker,
  removeSpeaker,
  setSpeaker,
}: EventFormTabSpeakersProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center justify-between">
        <Label>Konuşmacılar / Eğitmenler</Label>
        <Button type="button" variant="outline" size="sm" onClick={addSpeaker} className="gap-1">
          <Plus className="size-4" />
          Ekle
        </Button>
      </div>
      {speakers.length === 0 && mode === "edit" && (
        <p className="text-sm text-muted-foreground">Düzenleme sayfasında konuşmacılar yüklenir.</p>
      )}
      {speakers.map((sp, i) => (
        <Card key={i} className="p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Konuşmacı {i + 1}</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeSpeaker(i)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Ad Soyad *"
              value={sp.full_name}
              onChange={(e) => setSpeaker(i, "full_name", e.target.value)}
            />
            <Input placeholder="Ünvan" value={sp.title ?? ""} onChange={(e) => setSpeaker(i, "title", e.target.value)} />
            <Input
              placeholder="Fotoğraf URL"
              value={sp.photo_url ?? ""}
              onChange={(e) => setSpeaker(i, "photo_url", e.target.value)}
            />
            <Input
              placeholder="Konuşma Başlığı"
              value={sp.talk_title ?? ""}
              onChange={(e) => setSpeaker(i, "talk_title", e.target.value)}
            />
            <Input
              placeholder="LinkedIn URL"
              value={sp.linkedin_url ?? ""}
              onChange={(e) => setSpeaker(i, "linkedin_url", e.target.value)}
            />
            <Input
              placeholder="GitHub URL"
              value={sp.github_url ?? ""}
              onChange={(e) => setSpeaker(i, "github_url", e.target.value)}
            />
          </div>
        </Card>
      ))}
    </div>
  )
}
