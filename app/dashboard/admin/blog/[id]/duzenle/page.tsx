import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { BlogPostForm } from "../../_components/BlogPostForm"

export default async function AdminBlogDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).single()
  if (!post) notFound()

  return (
    <div className="space-y-6">
      <BlogPostForm
        mode="edit"
        postId={post.id}
        initialValues={{
          title: post.title,
          slug: post.slug,
          body: post.body,
          status: post.status ?? "draft",
          cover_image_url: post.cover_image_url ?? undefined,
        }}
      />
    </div>
  )
}
