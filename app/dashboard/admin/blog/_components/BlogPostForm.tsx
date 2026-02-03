"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { createBlogPost, updateBlogPost, type BlogFormState } from "../actions"
import { toast } from "sonner"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BlogPostFormProps {
  mode: "create" | "edit"
  postId?: string
  initialValues?: {
    title: string
    slug: string
    body: string
    status: string
    cover_image_url?: string
  }
  /** Geri / İptal linki (varsayılan: admin blog) */
  backHref?: string
  /** Oluşturma sonrası yönlendirme (varsayılan: admin blog) */
  successRedirect?: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="gap-2">
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Kaydediliyor..." : "Kaydet"}
    </Button>
  )
}

const DEFAULT_BACK_HREF = "/dashboard/admin/blog"

export function BlogPostForm({
  mode,
  postId,
  initialValues,
  backHref = DEFAULT_BACK_HREF,
  successRedirect = DEFAULT_BACK_HREF,
}: BlogPostFormProps) {
  const router = useRouter()
  const action =
    mode === "create"
      ? createBlogPost
      : (prev: BlogFormState, fd: FormData) => updateBlogPost(postId!, prev, fd)

  const [state, formAction] = useActionState(action, { ok: false })

  useEffect(() => {
    if (state.ok) {
      toast.success(mode === "create" ? "Yazı eklendi" : "Yazı güncellendi")
      if (mode === "create") router.push(successRedirect)
      else router.refresh()
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, mode, router, successRedirect])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={backHref}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <CardTitle>{mode === "create" ? "Yeni yazı" : "Yazıyı düzenle"}</CardTitle>
            <CardDescription>
              {mode === "create" ? "Blog yazısı oluşturun." : "Blog yazısını güncelleyin."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Yazı başlığı"
              defaultValue={initialValues?.title}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="url-friendly-slug"
              defaultValue={initialValues?.slug}
              required
            />
            <p className="text-xs text-muted-foreground">Sadece küçük harf, rakam ve tire. Örn: kariyer-ipuclari</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover_image_url">Kapak resmi URL</Label>
            <Input
              id="cover_image_url"
              name="cover_image_url"
              type="url"
              placeholder="https://..."
              defaultValue={initialValues?.cover_image_url ?? ""}
            />
            <p className="text-xs text-muted-foreground">İsteğe bağlı. Yazı detayında görünecek kapak görseli.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">İçerik *</Label>
            <Textarea
              id="body"
              name="body"
              placeholder="Yazı içeriği (Markdown veya düz metin)"
              defaultValue={initialValues?.body}
              rows={14}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status"></Label>
            <Select>
              <SelectTrigger className="w-full max-w-48">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem id="status" value="draft">Taslak</SelectItem>
                  <SelectItem id="status" value="published">Yayınla</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <SubmitButton />
            <Button type="button" variant="outline" asChild>
              <Link href={backHref}>İptal</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
