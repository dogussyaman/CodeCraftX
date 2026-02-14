import { BlogPostForm } from "../_components/BlogPostForm"

export default function AdminBlogOlusturPage() {
  return (
    <div className="space-y-6">
      <BlogPostForm mode="create" />
    </div>
  )
}
