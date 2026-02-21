import { updateSession } from "@/lib/supabase/proxy"
import { NextResponse, type NextRequest } from "next/server"

/** Ödeme callback: POST ile gelen isteği 303 ile GET'e çevir (405 önleme). */
function handlePaymentCallbackRedirect(request: NextRequest): NextResponse | null {
  if (request.method !== "POST") return null
  const pathname = request.nextUrl.pathname
  const payment = request.nextUrl.searchParams.get("payment")
  const token = request.nextUrl.searchParams.get("token")
  const isPaymentCallback = payment === "callback" && token
  if (!isPaymentCallback) return null

  if (pathname === "/dashboard/company/uyelik") {
    return NextResponse.redirect(request.nextUrl, 303)
  }
  if (pathname === "/auth/giris" || pathname === "/giris") {
    const uyelik = new URL("/dashboard/company/uyelik", request.nextUrl.origin)
    uyelik.searchParams.set("payment", "callback")
    uyelik.searchParams.set("token", token!)
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
