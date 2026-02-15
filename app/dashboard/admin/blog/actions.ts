"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const blogPostSchema = z.object({
  title: z.string().min(2, "Başlık en az 2 karakter olmalıdır"),
  slug: z.string().min(2, "Slug en az 2 karakter olmalıdır").regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire"),
  body: z.string().min(10, "İçerik en az 10 karakter olmalıdır"),
  status: z.enum(["draft", "published"]).default("draft"),
  cover_image_url: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "") ? null : v,
    z.union([z.string().url("Geçerli bir URL girin"), z.null()])
  ).optional(),
})

export type BlogFormState = { ok: boolean; error?: string }

export async function createBlogPost(prev: BlogFormState, formData: FormData): Promise<BlogFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Oturum açmanız gerekiyor" }

  const raw = {
    title: formData.get("title"),
    slug: (formData.get("slug") as string)?.toLowerCase().trim().replace(/\s+/g, "-"),
    body: formData.get("body"),
    status: formData.get("status") || "draft",
    cover_image_url: (formData.get("cover_image_url") as string)?.trim() || null,
  }
  const parsed = blogPostSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? "Veri doğrulama hatası"
    return { ok: false, error: msg }
  }

  const published_at = parsed.data.status === "published" ? new Date().toISOString() : null
  const cover_image_url = parsed.data.cover_image_url && parsed.data.cover_image_url !== "" ? parsed.data.cover_image_url : null

  const { error } = await supabase.from("blog_posts").insert({
    title: parsed.data.title,
    slug: parsed.data.slug,
    body: parsed.data.body,
    author_id: user.id,
    status: parsed.data.status,
    published_at,
    cover_image_url,
  })

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Bu slug zaten kullanılıyor" }
    console.error("Blog post create error:", error)
    return { ok: false, error: "Yazı eklenemedi" }
  }

  revalidatePath("/dashboard/admin/blog")
  revalidatePath("/dashboard/gelistirici/yazilarim")
  revalidatePath("/blog")
  revalidatePath("/community")
  return { ok: true }
}

export async function updateBlogPost(
  postId: string,
  prev: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Oturum açmanız gerekiyor" }

  const raw = {
    title: formData.get("title"),
    slug: (formData.get("slug") as string)?.toLowerCase().trim().replace(/\s+/g, "-"),
    body: formData.get("body"),
    status: formData.get("status") || "draft",
    cover_image_url: (formData.get("cover_image_url") as string)?.trim() || null,
  }
  const parsed = blogPostSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? "Veri doğrulama hatası"
    return { ok: false, error: msg }
  }

  const cover_image_url = parsed.data.cover_image_url && parsed.data.cover_image_url !== "" ? parsed.data.cover_image_url : null

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("published_at, author_id")
    .eq("id", postId)
    .single()
  if (!existing || existing.author_id !== user.id) return { ok: false, error: "Yetkisiz" }

  const published_at =
    parsed.data.status === "published"
      ? existing.published_at ?? new Date().toISOString()
      : null

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title: parsed.data.title,
      slug: parsed.data.slug,
      body: parsed.data.body,
      status: parsed.data.status,
      published_at,
      updated_at: new Date().toISOString(),
      cover_image_url,
    })
    .eq("id", postId)
    .eq("author_id", user.id)

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Bu slug zaten kullanılıyor" }
    console.error("Blog post update error:", error)
    return { ok: false, error: "Yazı güncellenemedi" }
  }

  revalidatePath("/dashboard/admin/blog")
  revalidatePath(`/dashboard/admin/blog/${postId}/duzenle`)
  revalidatePath("/dashboard/gelistirici/yazilarim")
  revalidatePath("/blog")
  revalidatePath(`/blog/${parsed.data.slug}`)
  revalidatePath("/community")
  return { ok: true }
}

export async function deleteBlogPost(postId: string): Promise<BlogFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Oturum açmanız gerekiyor" }

  const { data: deleted, error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", postId)
    .eq("author_id", user.id)
    .select("id")
  if (error) {
    console.error("Blog post delete error:", error)
    return { ok: false, error: "Yazı silinemedi" }
  }
  if (!deleted?.length) return { ok: false, error: "Yetkisiz" }

  revalidatePath("/dashboard/admin/blog")
  revalidatePath("/dashboard/gelistirici/yazilarim")
  revalidatePath("/blog")
  revalidatePath("/community")
  return { ok: true }
}
