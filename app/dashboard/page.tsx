import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/giris")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  const role = (profile?.role as string) || "developer"

  if (role === "admin" || role === "platform_admin" || role === "mt") redirect("/dashboard/admin")
  if (role === "hr") redirect("/dashboard/ik")
  if (role === "company_admin") redirect("/dashboard/company")
  redirect("/dashboard/gelistirici")
}
