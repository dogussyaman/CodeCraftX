import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/companies/my/hr-profiles
 * Şirketin İK / company_admin kullanıcılarını döner (görüşmeye davet listesi için).
 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single()

  const companyId = (profile as { company_id?: string } | null)?.company_id
  if (!companyId) {
    return NextResponse.json({ profiles: [] })
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("company_id", companyId)
    .in("role", ["hr", "company_admin"])
    .neq("id", user.id)
    .order("full_name", { ascending: true })

  return NextResponse.json({
    profiles: (profiles ?? []).map((p) => ({
      id: p.id,
      full_name: (p as { full_name?: string }).full_name,
      email: (p as { email?: string }).email,
    })),
  })
}
