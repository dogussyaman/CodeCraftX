"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addBlogComment(postId: string, body: string, parentId: string | null = null) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Yorum yapmak için giriş yapmalısınız" }

  const trimmed = body?.trim()
  if (!trimmed || trimmed.length < 2) return { ok: false, error: "En az 2 karakter yazın" }

  const { data: post } = await supabase
    .from("blog_posts")
    .select("id, slug")
    .eq("id", postId)
    .eq("status", "published")
    .single()
  if (!post) return { ok: false, error: "Yazı bulunamadı" }

  const { error } = await supabase.from("blog_comments").insert({
    post_id: postId,
    user_id: user.id,
    parent_id: parentId || null,
    body: trimmed,
  })
  if (error) {
    console.error("Blog comment insert error:", error)
    return { ok: false, error: "Yorum eklenemedi" }
  }

  revalidatePath(`/blog/${post.slug}`)
  revalidatePath("/blog")
  return { ok: true }
}

export async function incrementBlogPostView(postId: string) {
  const supabase = await createServerClient()

  const { data: post } = await supabase
    .from("blog_posts")
    .select("id, slug")
    .eq("id", postId)
    .eq("status", "published")
    .single()
  if (!post) return { ok: false, error: "Yazı bulunamadı" }

  const { error } = await supabase.rpc("increment_blog_post_view", {
    p_post_id: postId,
  })

  if (error) {
    console.error("Blog post view increment error:", error)
    const msg = (error as { message?: string }).message ?? ""
    const isMissingColumn =
      msg.includes("view_count") ||
      (msg.includes("column") && msg.toLowerCase().includes("does not exist"))
    const isMissingFunction =
      (msg.includes("function") && msg.includes("does not exist")) ||
      msg.toLowerCase().includes("could not find") ||
      msg.includes("fonksiyon") ||
      msg.includes("bulunamadı") ||
      (error as { code?: string }).code === "PGRST202"
    const userMessage = isMissingColumn
      ? "Görüntülenme sayılamadı. Önce Supabase'de scripts/04_blog_stats.sql migration'ını çalıştırın."
      : isMissingFunction
        ? "Görüntülenme sayılamadı. Supabase'de scripts/06_increment_blog_post_view.sql migration'ını çalıştırın."
        : msg || "Görüntülenme artırılamadı"
    return { ok: false, error: userMessage }
  }

  revalidatePath(`/blog/${(post as { slug: string }).slug}`)
  revalidatePath("/blog")
  return { ok: true }
}

export async function toggleBlogPostLike(postId: string) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Beğenmek için giriş yapmalısınız" }

  const { data: post } = await supabase
    .from("blog_posts")
    .select("id, slug, like_count")
    .eq("id", postId)
    .eq("status", "published")
    .single()
  if (!post) return { ok: false, error: "Yazı bulunamadı" }

  const { data: existing } = await supabase
    .from("blog_post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle()

  const current = (post as { like_count?: number }).like_count ?? 0

  if (existing) {
    const { error: delErr } = await supabase
      .from("blog_post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id)
    if (delErr) {
      console.error("Blog post unlike error:", delErr)
      return { ok: false, error: "Beğeni kaldırılamadı" }
    }
    const newCount = Math.max(0, current - 1)
    await supabase
      .from("blog_posts")
      .update({ like_count: newCount })
      .eq("id", postId)
    revalidatePath(`/blog/${(post as { slug: string }).slug}`)
    revalidatePath("/blog")
    return { ok: true, liked: false, likeCount: newCount }
  } else {
    const { error: insErr } = await supabase.from("blog_post_likes").insert({
      post_id: postId,
      user_id: user.id,
    })
    if (insErr) {
      console.error("Blog post like error:", insErr)
      return { ok: false, error: "Beğeni eklenemedi" }
    }
    const newCount = current + 1
    await supabase
      .from("blog_posts")
      .update({ like_count: newCount })
      .eq("id", postId)
    revalidatePath(`/blog/${(post as { slug: string }).slug}`)
    revalidatePath("/blog")
    return { ok: true, liked: true, likeCount: newCount }
  }
}
