// Supabase Edge Function: verify-payment (iyzico checkout form result)
// POST body: { token }. Calls iyzico detail then updates company_payments + companies.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const IYZICO_API_KEY = Deno.env.get("IYZICO_API_KEY")
const IYZICO_SECRET_KEY = Deno.env.get("IYZICO_SECRET_KEY")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

/** iyzico IYZWSv2 auth: randomKey + uri_path + body -> HMACSHA256, then base64(apiKey&randomKey&signature) */
async function buildIyzicoAuth(apiKey: string, secretKey: string, uriPath: string, bodyStr: string): Promise<{ authorization: string; xIyziRnd: string }> {
  const randomKey = `${Date.now()}${Math.random().toString(36).slice(2, 12)}`
  const payload = randomKey + uriPath + bodyStr

  const keyData = new TextEncoder().encode(secretKey)
  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  const data = new TextEncoder().encode(payload)
  const sig = await crypto.subtle.sign("HMAC", key, data)
  const signature = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  const authString = `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`
  const bytes = new TextEncoder().encode(authString)
  const binary = bytes.reduce((acc, b) => acc + String.fromCharCode(b), "")
  const base64Auth = btoa(binary)
  return { authorization: `IYZWSv2 ${base64Auth}`, xIyziRnd: randomKey }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  if (!IYZICO_API_KEY || !IYZICO_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "Iyzico not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const token = typeof body?.token === "string" ? body.token.trim() : null

    if (!token) {
      return new Response(JSON.stringify({ error: "token required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const detailBody = { locale: "tr", conversationId: "verify", token }
    const detailBodyStr = JSON.stringify(detailBody)
    const uriPath = "/payment/iyzipos/checkoutform/auth/ecom/detail"
    const { authorization, xIyziRnd } = await buildIyzicoAuth(IYZICO_API_KEY, IYZICO_SECRET_KEY, uriPath, detailBodyStr)
    const detailResponse = await fetch("https://sandbox-api.iyzipay.com" + uriPath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authorization,
        "x-iyzi-rnd": xIyziRnd,
      },
      body: detailBodyStr,
    })

    const result = await detailResponse.json().catch(() => ({}))

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Log verify attempt (payment_logs)
    const logPayload = { token: token.slice(0, 8) + "...", paymentStatus: result.paymentStatus, conversationId: result.conversationId }

    if (result.paymentStatus !== "SUCCESS") {
      const { data: failedRow } = await supabase
        .from("company_payments")
        .select("id")
        .eq("iyzico_token", token)
        .limit(1)
        .single()
      if (failedRow) {
        try {
          await supabase.from("payment_logs").insert({
            company_payment_id: failedRow.id,
            event: "verify_failed",
            payload: { ...logPayload, iyzicoResponse: result },
          })
        } catch (_) {}
      }
      return new Response(
        JSON.stringify({ success: false, error: result.errorMessage || "Payment not successful" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Idempotency: find payment by token (stored in create-payment from iyzico initialize response)
    const { data: paymentRow, error: findError } = await supabase
      .from("company_payments")
      .select("id, company_id, plan, billing_period, amount, status")
      .eq("iyzico_token", token)
      .limit(1)
      .single()

    if (findError || !paymentRow) {
      return new Response(JSON.stringify({ error: findError?.message ?? "Payment not found" }), {
        status: findError ? 500 : 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const payment = paymentRow

    if (payment.status === "success") {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const now = new Date().toISOString()

    await supabase
      .from("company_payments")
      .update({
        status: "success",
        paid_at: now,
        iyzico_token: token,
      })
      .eq("id", payment.id)

    const { data: existingCompany } = await supabase
      .from("companies")
      .select("subscription_started_at")
      .eq("id", payment.company_id)
      .single()

    const subscriptionStartedAt = existingCompany?.subscription_started_at ?? now
    const baseDate = new Date(now)
    const endsAt = new Date(baseDate)
    if (payment.billing_period === "annually") {
      endsAt.setFullYear(endsAt.getFullYear() + 1)
    } else {
      endsAt.setMonth(endsAt.getMonth() + 1)
    }
    const subscriptionEndsAt = endsAt.toISOString()

    await supabase
      .from("companies")
      .update({
        plan: payment.plan,
        subscription_status: "active",
        billing_period: payment.billing_period,
        current_plan_price: payment.amount,
        last_payment_at: now,
        subscription_started_at: subscriptionStartedAt,
        subscription_ends_at: subscriptionEndsAt,
      })
      .eq("id", payment.company_id)

    try {
      await supabase.from("payment_logs").insert({
        company_payment_id: payment.id,
        event: "verify_success",
        payload: logPayload,
      })
    } catch (_) {}

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("verify-payment error:", err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
