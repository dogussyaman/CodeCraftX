import { NextResponse } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const token = typeof body?.token === "string" ? body.token.trim() : null

    if (!token) {
      return NextResponse.json({ error: "token required" }, { status: 400 })
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 })
    }

    const edgeRes = await fetch(`${SUPABASE_URL}/functions/v1/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ token }),
    })

    const data = await edgeRes.json().catch(() => ({}))
    if (!edgeRes.ok) {
      return NextResponse.json(
        { success: false, error: data.error ?? "Doğrulama başarısız" },
        { status: edgeRes.status >= 500 ? 500 : 400 }
      )
    }

    return NextResponse.json({ success: data.success !== false, error: data.error ?? null })
  } catch (error: unknown) {
    console.error("verify-payment error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Beklenmeyen hata" },
      { status: 500 }
    )
  }
}
