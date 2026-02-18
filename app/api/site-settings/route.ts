import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { ThemeAccent } from "@/components/theme-accent-provider"

const ACCENT_KEYS = ["orange", "blue", "purple", "green", "red"] as const
const DEFAULT_ACCENT: ThemeAccent = "orange"

export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "default_theme_accent")
      .maybeSingle()

    if (error) {
      return NextResponse.json({ defaultThemeAccent: DEFAULT_ACCENT })
    }
    const value = (data?.value ?? DEFAULT_ACCENT) as string
    const accent = ACCENT_KEYS.includes(value as (typeof ACCENT_KEYS)[number])
      ? (value as ThemeAccent)
      : DEFAULT_ACCENT
    return NextResponse.json({ defaultThemeAccent: accent })
  } catch {
    return NextResponse.json({ defaultThemeAccent: DEFAULT_ACCENT })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const accent = body?.defaultThemeAccent as string | undefined
    if (!accent || !ACCENT_KEYS.includes(accent as (typeof ACCENT_KEYS)[number])) {
      return NextResponse.json({ error: "Geçersiz tema rengi" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    const adminRoles = ["admin", "platform_admin", "mt"]
    if (!profile || !adminRoles.includes(profile.role)) {
      return NextResponse.json({ error: "Sadece admin site varsayılanını değiştirebilir" }, { status: 403 })
    }

    const admin = createAdminClient()
    const { error: updateError } = await admin
      .from("site_settings")
      .upsert({ key: "default_theme_accent", value: accent }, { onConflict: "key" })

    if (updateError) {
      return NextResponse.json({ error: "Kaydedilemedi" }, { status: 500 })
    }
    return NextResponse.json({ defaultThemeAccent: accent })
  } catch (e) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
