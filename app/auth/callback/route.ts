import { createServerClient } from "@/lib/supabase/server"
import { MT_DASHBOARD_LOGIN_URL } from "@/lib/constants"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Password reset durumu - hash fragment ile geldiğinde sifre-sifirla sayfasına yönlendir
  if (type === "recovery") {
    return NextResponse.redirect(`${requestUrl.origin}/auth/sifre-sifirla`)
  }

  // OAuth hata durumu
  if (error) {
    console.error("OAuth error:", error, errorDescription)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/hata?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || "OAuth girişi başarısız")}`
    )
  }

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/auth/giris?error=no_code`)
  }

  try {
    const supabase = await createServerClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("Session exchange error:", exchangeError)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/hata?error=exchange_failed&message=${encodeURIComponent(exchangeError.message)}`
      )
    }

    // Kullanıcı profilini kontrol et ve rolüne göre yönlendir
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("User fetch error:", userError)
      return NextResponse.redirect(`${requestUrl.origin}/auth/giris?error=user_fetch_failed`)
    }

    // Profil kontrolü
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, must_change_password")
      .eq("id", user.id)
      .single()

    // Profil yoksa oluştur (trigger çalışmamış olabilir)
    if (!profile && !profileError) {
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.user_name || "Kullanıcı",
        role: user.user_metadata?.role || "developer",
      })

      if (insertError) {
        console.error("Profile creation error:", insertError)
        // Profil oluşturulamazsa bile devam et, trigger sonra oluşturabilir
      }
    }

    // İlk giriş şifre değiştirme kontrolü
    if (profile?.must_change_password) {
      return NextResponse.redirect(`${requestUrl.origin}/auth/sifre-degistir?first_login=true`)
    }

    const role = profile?.role || user.user_metadata?.role || "developer"

    // MT kullanıcıları CodeCraftX'de oturum açmasın; MT Dashboard'a yönlendir
    if (role === "mt") {
      await supabase.auth.signOut()
      return NextResponse.redirect(MT_DASHBOARD_LOGIN_URL)
    }

    // Rolüne göre yönlendir
    let redirectPath = "/dashboard/gelistirici"

    if (role === "admin") {
      redirectPath = "/dashboard/admin"
    } else if (role === "hr") {
      redirectPath = "/dashboard/ik"
    } else if (role === "company_admin") {
      redirectPath = "/dashboard/company"
    }

    return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)
  } catch (error) {
    console.error("Unexpected error in OAuth callback:", error)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/hata?error=unexpected&message=${encodeURIComponent("Beklenmeyen bir hata oluştu")}`
    )
  }
}
