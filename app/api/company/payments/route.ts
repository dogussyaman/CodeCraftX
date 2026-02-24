import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .single()

    if (!profile?.company_id) {
      return NextResponse.json({ error: "Şirket bulunamadı" }, { status: 403 })
    }

    const allowedRoles = ["company_admin", "hr"]
    if (!profile.role || !allowedRoles.includes(profile.role)) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const admin = createAdminClient()

    const { data: payments, error: paymentsError } = await admin
      .from("company_payments")
      .select("id, plan, billing_period, amount, status, provider, paid_at, created_at, metadata")
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: false })
      .limit(100)

    if (paymentsError) {
      console.error("[company/payments] DB error:", paymentsError)
      return NextResponse.json({ error: paymentsError.message }, { status: 500 })
    }

    return NextResponse.json({ payments: payments ?? [] })
  } catch (err) {
    console.error("[company/payments] error:", err)
    return NextResponse.json({ error: "Beklenmeyen hata" }, { status: 500 })
  }
}
