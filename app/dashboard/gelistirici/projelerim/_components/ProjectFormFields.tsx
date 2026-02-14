"use client"

import { useFormStatus } from "react-dom"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RichEditor } from "@/components/ui/rich-editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { ProjectFormInitialValues } from "./project-form-types"

function SubmitButton({ status }: { status: string }) {
  const { pending } = useFormStatus()
  const isPublish = status === "published"
  const label = pending
    ? isPublish
      ? "Yayınlanıyor..."
      : "Kaydediliyor..."
    : isPublish
      ? "Yayınla"
      : "Kaydet"
  return (
    <Button type="submit" disabled={pending} className="gap-2">
      {pending && <Loader2 className="size-4 animate-spin" />}
      {label}
    </Button>
  )
}

export interface ProjectFormFieldsProps {
  /** Form action (from useActionState); may be (formData) or (prev, formData) */
  formAction: (prevOrFormData: unknown, formData?: FormData) => void | Promise<unknown>
  error?: string
  imageUrl: string
  listPath: string
  /** Controlled when showSidebarPreview */
  title: string
  setTitle: (v: string) => void
  description: string
  setDescription: (v: string) => void
  longDescription: string
  setLongDescription: (v: string) => void
  technologies: string
  setTechnologies: (v: string) => void
  status: string
  setStatus: (v: string) => void
  initialValues?: ProjectFormInitialValues | null
  showSidebarPreview?: boolean
}

export function ProjectFormFields({
  formAction,
  error,
  imageUrl,
  listPath,
  title,
  setTitle,
  description,
  setDescription,
  longDescription,
  setLongDescription,
  technologies,
  setTechnologies,
  status,
  setStatus,
  initialValues,
  showSidebarPreview = false,
}: ProjectFormFieldsProps) {
  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3" role="alert">
            {error}
          </div>
        )}
        <input type="hidden" name="image_url" value={imageUrl} />
        <div className="space-y-2">
          <Label htmlFor="title">Başlık *</Label>
          <Input
            id="title"
            name="title"
            placeholder="Proje adı"
            value={showSidebarPreview ? title : undefined}
            defaultValue={showSidebarPreview ? undefined : initialValues?.title}
            onChange={showSidebarPreview ? (e) => setTitle(e.target.value) : undefined}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Kısa açıklama *</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Birkaç cümleyle projeyi tanıtın"
            value={showSidebarPreview ? description : undefined}
            defaultValue={showSidebarPreview ? undefined : initialValues?.description}
            onChange={showSidebarPreview ? (e) => setDescription(e.target.value) : undefined}
            rows={3}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="long_description">Detaylı açıklama</Label>
          <RichEditor
            id="long_description"
            value={longDescription}
            onChange={setLongDescription}
            placeholder="Kurulum, kullanım, katkı rehberi vb."
            minHeight="14rem"
            aria-label="Detaylı açıklama"
          />
          <input type="hidden" name="long_description" value={longDescription} />
          {!showSidebarPreview && longDescription.trim() && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Önizleme</p>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{longDescription}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="technologies">Teknolojiler</Label>
          <Input
            id="technologies"
            name="technologies"
            placeholder="React, TypeScript, Node.js (virgülle ayırın)"
            value={showSidebarPreview ? technologies : undefined}
            defaultValue={
              showSidebarPreview ? undefined : (Array.isArray(initialValues?.technologies) ? initialValues.technologies.join(", ") : "")
            }
            onChange={showSidebarPreview ? (e) => setTechnologies(e.target.value) : undefined}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="github_url">GitHub URL</Label>
            <Input
              id="github_url"
              name="github_url"
              type="url"
              placeholder="https://github.com/..."
              defaultValue={initialValues?.github_url ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo_url">Demo URL</Label>
            <Input
              id="demo_url"
              name="demo_url"
              type="url"
              placeholder="https://..."
              defaultValue={initialValues?.demo_url ?? ""}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="inspired_by">İlham alınan proje</Label>
          <Input
            id="inspired_by"
            name="inspired_by"
            placeholder="URL veya kısa açıklama (örn: GitHub repo linki)"
            defaultValue={initialValues?.inspired_by ?? ""}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input
              id="category"
              name="category"
              placeholder="örn. Web, CLI, Oyun"
              defaultValue={initialValues?.category ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Durum</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Taslak</SelectItem>
                <SelectItem value="published">Yayınla</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="status" value={status} />
          </div>
        </div>
        <div className="flex gap-2">
          <SubmitButton status={status} />
          <Button type="button" variant="outline" asChild>
            <Link href={listPath}>İptal</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
