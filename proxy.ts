import { updateSession } from "@/lib/supabase/proxy"
import { NextResponse, type NextRequest } from "next/server"

/** Ödeme callback: POST ile gelen isteği 303 ile GET'e çevir (405 önleme). */
function handlePaymentCallbackRedirect(request: NextRequest): NextResponse | null {
  const method = request.method
  const pathname = request.nextUrl.pathname
  const payment = request.nextUrl.searchParams.get("payment")
  const token = request.nextUrl.searchParams.get("token")
  const isPaymentCallback = payment === "callback" && !!token

  console.log(`[proxy] ${method} ${pathname} | payment=${payment} | hasToken=${!!token}`)

  if (method !== "POST") return null
  if (!isPaymentCallback) return null

  if (pathname === "/dashboard/company/uyelik") {
    console.log(`[proxy] POST payment callback on uyelik → 303 GET`)
    return NextResponse.redirect(request.nextUrl, 303)
  }
  if (pathname === "/auth/giris" || pathname === "/giris") {
    const uyelik = new URL("/dashboard/company/uyelik", request.nextUrl.origin)
    uyelik.searchParams.set("payment", "callback")
    uyelik.searchParams.set("token", token!)
    console.log(`[proxy] POST payment callback on giris → 303 GET uyelik`)
    return NextResponse.redirect(uyelik, 303)
  }
  return null
}

export async function proxy(request: NextRequest) {
  const paymentRedirect = handlePaymentCallbackRedirect(request)
  if (paymentRedirect) return paymentRedirect
  return await updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
