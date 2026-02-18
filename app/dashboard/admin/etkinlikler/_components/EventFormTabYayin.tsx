"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PlatformEventRow } from "./event-form-types"

interface EventFormTabYayinProps {
  initialValues?: Partial<PlatformEventRow>
  status: string
  setStatus: (v: string) => void
  featured: boolean
  setFeatured: (v: boolean) => void
}

export function EventFormTabYayin({ initialValues, status, setStatus, featured, setFeatured }: EventFormTabYayinProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="slug">Slug * (URL)</Label>
        <Input
          id="slug"
          name="slug"
          placeholder="react-workshop-2025"
          defaultValue={initialValues?.slug ?? ""}
          required
        />
        <p className="text-xs text-muted-foreground">Sadece küçük harf, rakam ve tire. Örn: react-workshop-2025</p>
      </div>
      <div className="space-y-2">
        <Label>Durum</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Taslak</SelectItem>
            <SelectItem value="published">Yayında</SelectItem>
            <SelectItem value="cancelled">İptal Edildi</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="featured"
          name="featured"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="rounded border-input"
        />
        <Label htmlFor="featured">Öne çıkan etkinlik</Label>
      </div>
      <input type="hidden" name="featured" value={String(featured)} />
    </div>
  )
}
