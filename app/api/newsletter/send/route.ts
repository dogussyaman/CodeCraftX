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
      .select("id, title, image_url, body_html, sent_at")
      .eq("id", campaignId)
      .single()

    if (fetchError || !campaign) {
      return NextResponse.json({ error: "Kampanya bulunamadı" }, { status: 404 })
    }

    if (campaign.sent_at) {
      return NextResponse.json({ error: "Bu kampanya zaten gönderilmiş" }, { status: 400 })
    }

    const { data: subscribers, error: subscribersError } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .is("unsubscribed_at", null)

    if (subscribersError) {
      console.error("Newsletter subscribers fetch error:", subscribersError)
      return NextResponse.json(
        { error: "Aboneler alınamadı" },
        { status: 500 },
      )
    }

    if (!subscribers?.length) {
      console.warn("Newsletter send skipped: no subscribers found", { campaignId })
      return NextResponse.json(
        { error: "Gönderilecek abone bulunamadı, bülten henüz gönderilmedi" },
        { status: 400 },
      )
    }

    const htmlContent = [
      campaign.image_url ? `<p><img src="${campaign.image_url}" alt="" /></p>` : "",
      campaign.body_html ?? "",
    ]
      .filter(Boolean)
      .join("\n")

    const queuePayload = subscribers.map((subscriber) => ({
      recipient_email: subscriber.email,
      subject: campaign.title,
      html_content: htmlContent || undefined,
      email_type: "custom" as const,
      metadata: { campaign_id: campaign.id },
    }))

    const { error: queueError } = await supabase
      .from("email_queue")
      .insert(queuePayload)

    if (queueError) {
      console.error("Newsletter queue insert error:", queueError)
      return NextResponse.json(
        { error: "Bülten kuyruğa alınamadı" },
        { status: 500 },
      )
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

    return NextResponse.json({
      success: true,
      queued: subscribers.length,
      message: "Bülten kuyruğa alındı",
    })
  } catch (err: unknown) {
    console.error("Newsletter send unexpected error:", err)
    return NextResponse.json(
      { error: "Beklenmeyen bir hata oluştu" },
      { status: 500 },
    )
  }
}
