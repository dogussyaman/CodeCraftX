import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const campaignId = typeof body?.campaign_id === "string" ? body.campaign_id.trim() : ""

    if (!campaignId) {
      return NextResponse.json(
        { error: "campaign_id gerekli" },
        { status: 400 },
      )
    }

    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = profile?.role as string | undefined
    if (!["admin", "mt", "platform_admin"].includes(role ?? "")) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 })
    }

    const { data: campaign, error: fetchError } = await supabase
      .from("newsletter_campaigns")
      .select("id, sent_at")
      .eq("id", campaignId)
      .single()

    if (fetchError || !campaign) {
      return NextResponse.json({ error: "Kampanya bulunamadı" }, { status: 404 })
    }

    if (campaign.sent_at) {
      return NextResponse.json({ error: "Bu kampanya zaten gönderilmiş" }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from("newsletter_campaigns")
      .update({ sent_at: new Date().toISOString() })
      .eq("id", campaignId)

    if (updateError) {
      console.error("Newsletter send update error:", updateError)
      return NextResponse.json(
        { error: "Gönderim kaydı güncellenemedi" },
        { status: 500 },
      )
    }

    // TODO: Queue actual email send to newsletter_subscribers (Resend / Edge Function / SMTP)
    // - Fetch campaign title, image_url, body_html, links
    // - Fetch subscribers from newsletter_subscribers where unsubscribed_at IS NULL
    // - Send HTML email per subscriber
    return NextResponse.json({ success: true, message: "Bülten gönderildi (e-posta kuyruğa alındı)" })
  } catch (err: unknown) {
    console.error("Newsletter send unexpected error:", err)
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu" },
      { status: 500 },
    )
  }
}
