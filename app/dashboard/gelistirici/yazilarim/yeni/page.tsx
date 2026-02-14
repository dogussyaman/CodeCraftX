import { BlogPostForm } from "@/app/dashboard/admin/blog/_components/BlogPostForm"

export default function YazilarimYeniPage() {
  return (
    <div className="space-y-6">
      <BlogPostForm
        mode="create"
        backHref="/dashboard/gelistirici/yazilarim"
        successRedirect="/dashboard/gelistirici/yazilarim"
      />
    </div>
  )
}
