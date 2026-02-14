import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { BlogPostForm } from "@/app/dashboard/admin/blog/_components/BlogPostForm"

export default async function YazilarimDuzenlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .eq("author_id", user.id)
    .single()

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
        backHref="/dashboard/gelistirici/yazilarim"
        successRedirect="/dashboard/gelistirici/yazilarim"
      />
    </div>
  )
}
