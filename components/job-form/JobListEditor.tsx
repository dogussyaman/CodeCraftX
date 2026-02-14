"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

interface JobListEditorProps {
  titleLabel?: string
  subtitleLabel?: string
  title: string
  subtitle: string
  items: string[]
  onTitleChange: (v: string) => void
  onSubtitleChange: (v: string) => void
  onItemsChange: (items: string[]) => void
  itemPlaceholder?: string
  addLabel?: string
  optional?: boolean
  /** When false, only the list of items is shown (no title/subtitle inputs). */
  showTitleSubtitle?: boolean
}

export function JobListEditor({
  titleLabel = "Başlık",
  subtitleLabel = "Alt başlık",
  title,
  subtitle,
  items,
  onTitleChange,
  onSubtitleChange,
  onItemsChange,
  itemPlaceholder = "Madde girin...",
  addLabel = "Madde ekle",
  optional = true,
  showTitleSubtitle = true,
}: JobListEditorProps) {
  const addItem = () => {
    onItemsChange([...items, ""])
  }

  const updateItem = (index: number, value: string) => {
    const next = [...items]
    next[index] = value
    onItemsChange(next)
  }

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      {showTitleSubtitle && (
        <>
          <div className="grid gap-2">
            <Label className="text-sm">{titleLabel}{optional ? " (opsiyonel)" : ""}</Label>
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Örn: Gereksinimler"
              className="h-9"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-sm">{subtitleLabel}{optional ? " (opsiyonel)" : ""}</Label>
            <Input
              value={subtitle}
              onChange={(e) => onSubtitleChange(e.target.value)}
              placeholder="Örn: Senden neler bekliyoruz?"
              className="h-9"
            />
          </div>
        </>
      )}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Maddeler</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
            <Plus className="size-4" />
            {addLabel}
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => updateItem(i, e.target.value)}
                placeholder={itemPlaceholder}
                className="h-9 flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(i)}
                aria-label="Kaldır"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
