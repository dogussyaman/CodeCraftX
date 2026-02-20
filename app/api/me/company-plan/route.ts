import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { CompanyPlan } from "@/lib/types"

const COMPANY_ROLES = ["company", "company_admin", "hr"] as const

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ plan: null }, { status: 200 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .single()

    if (!profile?.company_id || !profile?.role || !COMPANY_ROLES.includes(profile.role as (typeof COMPANY_ROLES)[number])) {
      return NextResponse.json({ plan: null }, { status: 200 })
    }

    const { data: company } = await supabase
      .from("companies")
      .select("plan")
      .eq("id", profile.company_id)
      .single()

    const plan = (company?.plan as CompanyPlan) ?? "free"
    return NextResponse.json({ plan }, { status: 200 })
  } catch {
    return NextResponse.json({ plan: null }, { status: 200 })
  }
}
