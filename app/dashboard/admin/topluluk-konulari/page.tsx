import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CommunityTopicsManager } from "./_components/CommunityTopicsManager"

export default async function AdminToplulukKonulariPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/giris")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const role = (profile as { role?: string } | null)?.role
  if (!role || !["admin", "platform_admin", "mt"].includes(role)) redirect("/dashboard")

  const { data: topics } = await supabase
    .from("community_topics")
    .select("id, slug, label, sort_order")
    .order("sort_order", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Topluluk Konuları</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Topluluk sayfasında görünen konu listesini yönetin (Duyurular, Frontend, Backend, vb.).
        </p>
      </div>
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Konular</CardTitle>
          <CardDescription>Yeni konu ekleyebilir veya mevcut konuları sıralayabilirsiniz.</CardDescription>
        </CardHeader>
        <CardContent>
          <CommunityTopicsManager initialTopics={topics ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
