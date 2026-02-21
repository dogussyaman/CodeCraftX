// Supabase Edge Function: create-payment (iyzico checkout form initialize)
// Called by Next.js API with service role. Body: companyId, plan?, billingPeriod?, userId?

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const IYZICO_API_KEY = Deno.env.get("IYZICO_API_KEY")
const IYZICO_SECRET_KEY = Deno.env.get("IYZICO_SECRET_KEY")
const FRONTEND_SUCCESS_URL = Deno.env.get("FRONTEND_SUCCESS_URL") || Deno.env.get("NEXT_PUBLIC_APP_URL") || ""

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Same as lib/billing/plans.ts (free/orta/premium, monthly/annually TRY)
const PRICE_MAP: Record<string, Record<string, number>> = {
  free: { monthly: 0, annually: 0 },
  orta: { monthly: 1299, annually: 12990 },
  premium: { monthly: 2999, annually: 29990 },
}

function getPlanPrice(plan: string, billingPeriod: string): number {
  return PRICE_MAP[plan]?.[billingPeriod] ?? 0
}

const VALID_PLANS = ["free", "orta", "premium"]
const VALID_BILLING = ["monthly", "annually"]

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
    const companyId = body?.companyId
    let plan = VALID_PLANS.includes(body?.plan) ? body.plan : null
    let billingPeriod = VALID_BILLING.includes(body?.billingPeriod) ? body.billingPeriod : "monthly"
    const userId = body?.userId ?? null

    if (!companyId) {
      return new Response(JSON.stringify({ error: "companyId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, name, plan, contact_email, address, phone, location")
      .eq("id", companyId)
      .single()

    if (companyError || !company) {
      return new Response(JSON.stringify({ error: "Company not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (!plan) plan = (company.plan as string) || "free"
    const amount = getPlanPrice(plan, billingPeriod)
    if (amount <= 0) {
      return new Response(JSON.stringify({ error: "Invalid plan or free plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const conversationId = crypto.randomUUID()
    const basketId = crypto.randomUUID()

    const { data: paymentRow, error: insertError } = await supabase
      .from("company_payments")
      .insert({
        company_id: companyId,
        plan,
        billing_period: billingPeriod,
        amount,
        currency: "TRY",
        status: "pending",
        provider: "iyzico",
        metadata: { conversationId },
        conversation_id: conversationId,
      })
      .select("id")
      .single()

    if (insertError || !paymentRow) {
      return new Response(JSON.stringify({ error: insertError?.message ?? "Payment record failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const callbackUrl = FRONTEND_SUCCESS_URL
      ? `${FRONTEND_SUCCESS_URL.replace(/\/$/, "")}/api/company/iyzico-callback`
      : ""

    if (!callbackUrl) {
      await supabase
        .from("company_payments")
        .update({ status: "failed" })
        .eq("id", paymentRow.id)
      return new Response(JSON.stringify({ error: "FRONTEND_SUCCESS_URL not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const contactName = company.name || "Şirket"
    const email = company.contact_email || "test@test.com"
    const address = company.address || "Bursa"
    const city = (company.location || company.address || "Bursa").split(",")[0]?.trim() || "Bursa"
    const gsmNumber = (company.phone || "+905551234567").replace(/\s/g, "")

    const requestBody = {
      locale: "tr",
      conversationId,
      price: String(amount),
      paidPrice: String(amount),
      currency: "TRY",
      basketId,
      paymentGroup: "PRODUCT",
      callbackUrl,
      buyer: {
        id: userId || companyId,
        name: contactName.slice(0, 50) || "Test",
        surname: "User",
        identityNumber: "11111111111",
        email,
        gsmNumber: gsmNumber.slice(0, 20) || "+905551234567",
        registrationAddress: address.slice(0, 200) || "Bursa",
        city: city.slice(0, 50),
        country: "Turkey",
        zipCode: "16000",
      },
      shippingAddress: {
        contactName: contactName.slice(0, 100),
        city: city.slice(0, 50),
        country: "Turkey",
        address: address.slice(0, 200) || "Bursa",
        zipCode: "16000",
      },
      billingAddress: {
        contactName: contactName.slice(0, 100),
        city: city.slice(0, 50),
        country: "Turkey",
        address: address.slice(0, 200) || "Bursa",
        zipCode: "16000",
      },
      basketItems: [
        {
          id: "BI101",
          name: `Abonelik ${plan} - ${billingPeriod === "annually" ? "Yıllık" : "Aylık"}`,
          category1: "Abonelik",
          itemType: "VIRTUAL",
          price: String(amount),
        },
      ],
    }

    const uriPath = "/payment/iyzipos/checkoutform/initialize/auth/ecom"
    const bodyStr = JSON.stringify(requestBody)
    const { authorization, xIyziRnd } = await buildIyzicoAuth(IYZICO_API_KEY, IYZICO_SECRET_KEY, uriPath, bodyStr)
    const iyzicoResponse = await fetch("https://sandbox-api.iyzipay.com" + uriPath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authorization,
        "x-iyzi-rnd": xIyziRnd,
      },
      body: bodyStr,
    })

    const data = await iyzicoResponse.json().catch(() => ({}))

    if (data.status !== "success" || !data.checkoutFormContent) {
      await supabase
        .from("company_payments")
        .update({ status: "failed", metadata: { conversationId, iyzicoResponse: data } })
        .eq("id", paymentRow.id)
      return new Response(
        JSON.stringify({ error: data.errorMessage || "iyzico initialize failed", details: data }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (data.token) {
      await supabase
        .from("company_payments")
        .update({ iyzico_token: data.token })
        .eq("id", paymentRow.id)
    }

    return new Response(
      JSON.stringify({
        paymentId: paymentRow.id,
        checkoutFormContent: data.checkoutFormContent,
        token: data.token,
        conversationId: data.conversationId ?? conversationId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("create-payment error:", err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
