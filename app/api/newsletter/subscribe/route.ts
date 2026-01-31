import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body?.email === "string" ? body.email.trim() : ""

    if (!email) {
      return NextResponse.json(
        { error: "E-posta adresi gerekli" },
        { status: 400 },
      )
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi girin" },
        { status: 400 },
      )
    }

    const supabase = await createServerClient()

    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: email.toLowerCase(),
      source: "footer",
    })

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: true })
      }
      console.error("Newsletter subscribe error:", error)
      return NextResponse.json(
        { error: "Kayıt işlemi başarısız. Lütfen tekrar deneyin." },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error("Newsletter subscribe unexpected error:", err)
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu" },
      { status: 500 },
    )
  }
}
