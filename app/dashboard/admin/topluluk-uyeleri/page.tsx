import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CommunityMembersTable } from "./_components/CommunityMembersTable"

export default async function AdminToplulukUyeleriPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/giris")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const role = (profile as { role?: string } | null)?.role
  if (!role || !["admin", "platform_admin", "mt"].includes(role)) redirect("/dashboard")

  const { data: members } = await supabase
    .from("community_members")
    .select("id, user_id, joined_at, profiles(id, full_name, email, avatar_url)")
    .order("joined_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Topluluk Üyeleri</h1>
        <p className="text-sm text-muted-foreground mt-1">
          CodeCraftX topluluğuna katılan üyeleri görüntüleyin.
        </p>
      </div>
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Üye listesi</CardTitle>
          <CardDescription>Topluluğa katılmış kullanıcılar ({members?.length ?? 0} üye)</CardDescription>
        </CardHeader>
        <CardContent>
          <CommunityMembersTable members={members ?? []} />
        </CardContent>
      </Card>
    </div>
  )
}
