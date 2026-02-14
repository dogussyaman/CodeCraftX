import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createAdminClient } from "@/lib/supabase/admin"

const BATCH_SIZE = 20
const MAX_RETRIES = 3

/**
 * Cron/worker endpoint: email_queue'daki pending kayıtları Resend ile gönderir.
 * Vercel Cron veya harici cron ile çağrılmalı. CRON_SECRET ile korunur.
 *
 * Örnek: Authorization: Bearer <CRON_SECRET>
 * veya header: x-cron-secret: <CRON_SECRET>
 */
export async function GET(request: Request) {
  return processQueue(request)
}

export async function POST(request: Request) {
  return processQueue(request)
}

async function processQueue(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get("authorization")
    const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
    const headerSecret = request.headers.get("x-cron-secret")
    if (bearer !== cronSecret && headerSecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not set", processed: 0, sent: 0, failed: 0 },
      { status: 500 },
    )
  }

  const fromHello = process.env.RESEND_FROM ?? "CodeCrafters <hello@notificationscodecrafters.xyz>"
  const fromSupport = process.env.RESEND_FROM_SUPPORT ?? "CodeCrafters <support@notificationscodecrafters.xyz>"
  const supportEmailTypes = ["ticket_resolved"]
  const resend = new Resend(apiKey)
  const supabase = createAdminClient()

  const { data: rows, error: fetchError } = await supabase
    .from("email_queue")
    .select("id, recipient_email, recipient_name, subject, html_content, text_content, retry_count, email_type")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(BATCH_SIZE)

  if (fetchError) {
    console.error("email_queue fetch error:", fetchError)
    return NextResponse.json(
      { error: fetchError.message, processed: 0, sent: 0, failed: 0 },
      { status: 500 },
    )
  }

  if (!rows?.length) {
    return NextResponse.json({ processed: 0, sent: 0, failed: 0 })
  }

  let sent = 0
  let failed = 0

  for (const row of rows) {
    const from = supportEmailTypes.includes(row.email_type ?? "") ? fromSupport : fromHello
    const { error: sendError } = await resend.emails.send({
      from,
      to: row.recipient_email,
      subject: row.subject,
      html: row.html_content ?? undefined,
      text: row.text_content ?? undefined,
      replyTo: undefined,
    })

    if (sendError) {
      const retryCount = (row.retry_count ?? 0) + 1
      const newStatus = retryCount >= MAX_RETRIES ? "failed" : "pending"
      await supabase
        .from("email_queue")
        .update({
          status: newStatus,
          error_message: sendError.message,
          retry_count: retryCount,
          ...(newStatus === "failed" ? { sent_at: new Date().toISOString() } : {}),
        })
        .eq("id", row.id)
      failed++
      continue
    }

    await supabase
      .from("email_queue")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", row.id)
    sent++
  }

  return NextResponse.json({
    processed: rows.length,
    sent,
    failed,
  })
}
