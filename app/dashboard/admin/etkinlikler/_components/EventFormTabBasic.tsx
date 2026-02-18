"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RichEditor } from "@/components/ui/rich-editor"
import { EVENT_TYPES } from "./event-form-types"
import type { PlatformEventRow } from "./event-form-types"

interface EventFormTabBasicProps {
  initialValues?: Partial<PlatformEventRow>
  type: string
  setType: (v: string) => void
  description: string
  setDescription: (v: string) => void
}

export function EventFormTabBasic({
  initialValues,
  type,
  setType,
  description,
  setDescription,
}: EventFormTabBasicProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="title">Etkinlik Adı *</Label>
        <Input id="title" name="title" placeholder="Örn: React Workshop" defaultValue={initialValues?.title} required />
      </div>
      <div className="space-y-2">
        <Label>Tür *</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger id="type" className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="type" value={type} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="short_description">Kısa Açıklama</Label>
        <Textarea
          id="short_description"
          name="short_description"
          placeholder="Birkaç cümle"
          defaultValue={initialValues?.short_description ?? ""}
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label>Detaylı Açıklama (Markdown)</Label>
        <RichEditor
          id="description"
          value={description}
          onChange={setDescription}
          placeholder="Etkinlik detayları..."
          minHeight="12rem"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cover_image_url">Kapak Görseli URL</Label>
        <Input
          id="cover_image_url"
          name="cover_image_url"
          type="url"
          placeholder="https://..."
          defaultValue={initialValues?.cover_image_url ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Etiketler (virgülle ayırın)</Label>
        <Input
          id="tags"
          name="tags"
          placeholder="frontend, react, workshop"
          defaultValue={initialValues?.tags?.join(", ") ?? ""}
        />
      </div>
    </div>
  )
}
