import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const method = request.method
  const isPaymentCallback =
    request.nextUrl.searchParams.get("payment") === "callback" &&
    !!request.nextUrl.searchParams.get("token")

  console.log(`[proxy] ${method} ${pathname} | user=${user?.id ?? "none"} | paymentCallback=${isPaymentCallback}`)

  // Korumalı rotalar kontrolü
  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/giris"
    // 303 → tarayıcı yöntemi her zaman GET'e çevirir (307'de POST kalırdı)
    console.log(`[proxy] no user → redirect 303 to /auth/giris | method was ${method}`)
    return NextResponse.redirect(url, 303)
  }

  // Giriş yapmış kullanıcıları auth sayfalarından yönlendir
  if (
    (pathname.startsWith("/auth/giris") || pathname.startsWith("/auth/kayit")) &&
    user
  ) {
    // Ödeme callback ile gelindiyse token'ı uyelik sayfasında doğrulat
    if (isPaymentCallback) {
      const token = request.nextUrl.searchParams.get("token")
      const uyelik = new URL("/dashboard/company/uyelik", request.nextUrl.origin)
      uyelik.searchParams.set("payment", "callback")
      if (token) uyelik.searchParams.set("token", token)
      console.log(`[proxy] logged-in + payment callback → redirect to uyelik`)
      return NextResponse.redirect(uyelik)
    }

    const url = request.nextUrl.clone()
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role === "admin") {
      url.pathname = "/dashboard/admin"
    } else if (profile?.role === "hr") {
      url.pathname = "/dashboard/ik"
    } else {
      url.pathname = "/dashboard/gelistirici"
    }

    console.log(`[proxy] logged-in user on auth page → redirect to ${url.pathname}`)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
