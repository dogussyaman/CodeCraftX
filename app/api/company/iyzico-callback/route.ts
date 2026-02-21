import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || ""

/**
 * iyzico redirects the user here after payment (GET or POST with token).
 * We redirect to uyelik page with token so PaymentCallbackHandler can verify.
 */
function getBaseUrl(): string {
  if (APP_URL) return APP_URL.replace(/\/$/, "")
  return ""
}

/** 303 See Other: browser follows with GET (fixes POST→uyelik 405). */
function redirectToUyelik(base: string, token: string | null) {
  const target = new URL("/dashboard/company/uyelik", base)
  if (token) {
    target.searchParams.set("payment", "callback")
    target.searchParams.set("token", token)
  }
  return NextResponse.redirect(target, 303)
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")
  const base = getBaseUrl() || request.nextUrl.origin
  return redirectToUyelik(base, token)
}

export async function POST(request: NextRequest) {
  let token: string | null = null
  const contentType = request.headers.get("content-type") || ""
  try {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text()
      const params = new URLSearchParams(text)
      token = params.get("token")
    } else if (contentType.includes("application/json")) {
      const body = await request.json().catch(() => ({}))
      token = body?.token ?? null
    } else {
      const formData = await request.formData()
      token = (formData.get("token") as string) || null
    }
  } catch {
    // ignore
  }
  const base = getBaseUrl() || request.nextUrl.origin
  return redirectToUyelik(base, token)
}
