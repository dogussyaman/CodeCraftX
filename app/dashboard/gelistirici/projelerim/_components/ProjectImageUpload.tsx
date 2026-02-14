"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Loader2 } from "lucide-react"

interface ProjectImageUploadProps {
  imageUrl: string
  onRemove: () => void
  uploadFormRef: React.RefObject<HTMLFormElement | null>
  /** Form action (from useActionState); may be (formData) or (prev, formData) */
  uploadFormAction: (prevOrFormData: unknown, formData?: FormData) => void | Promise<unknown>
  isUploading: boolean
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ProjectImageUpload({
  imageUrl,
  onRemove,
  uploadFormRef,
  uploadFormAction,
  isUploading,
  onFileChange,
}: ProjectImageUploadProps) {
  return (
    <div className="space-y-2">
      <Label>Proje görseli (opsiyonel)</Label>
      {imageUrl ? (
        <div className="flex items-start gap-3">
          <div className="relative size-24 overflow-hidden rounded-lg border bg-muted shrink-0">
            <Image src={imageUrl} alt="Proje görseli" fill className="object-cover" sizes="96px" />
          </div>
          <Button type="button" variant="outline" size="sm" className="gap-1" onClick={onRemove}>
            <X className="size-3.5" />
            Kaldır
          </Button>
        </div>
      ) : (
        <form ref={uploadFormRef} action={uploadFormAction} className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="text-sm file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground file:text-sm"
            onChange={onFileChange}
          />
          {isUploading && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Loader2 className="size-4 animate-spin" />
              Yükleniyor…
            </span>
          )}
          <span className="text-xs text-muted-foreground">Dosya seçildiğinde otomatik yüklenir</span>
        </form>
      )}
    </div>
  )
}
