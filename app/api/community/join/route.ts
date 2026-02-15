import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    const role = (profile as { role?: string } | null)?.role
    const canJoin = role && ["developer", "admin", "platform_admin", "mt"].includes(role)
    if (!canJoin) {
      return NextResponse.json(
        { error: "Bu topluluk yalnızca geliştiriciler ve yöneticiler içindir." },
        { status: 403 }
      )
    }

    const { error } = await supabase.from("community_members").upsert(
      { user_id: user.id, role: "member" },
      { onConflict: "user_id" }
    )

    if (error) {
      console.error("Community join error:", error)
      return NextResponse.json(
        { error: "Katılım işlemi başarısız. Lütfen tekrar deneyin." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Community join unexpected error:", err)
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu" },
      { status: 500 }
    )
  }
}
