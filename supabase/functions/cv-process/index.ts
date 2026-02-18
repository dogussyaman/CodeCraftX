// Supabase Edge Function: CV Process
// Bu function CV dosyasını parse eder ve AI ile yapılandırılmış veri çıkarır

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface CVProcessRequest {
  cv_id: string
}

const MAX_CV_TEXT_LENGTH = 16000

const CV_JSON_SCHEMA = {
  name: "cv_profile",
  schema: {
    type: "object",
    properties: {
      skills: {
        type: "array",
        items: { type: "string" },
      },
      experience_years: {
        type: "number",
      },
      roles: {
        type: "array",
        items: { type: "string" },
      },
      seniority: {
        type: "string",
        enum: ["junior", "mid", "senior"],
      },
      summary: {
        type: "string",
      },
    },
    required: ["skills", "experience_years", "roles", "seniority", "summary"],
    additionalProperties: false,
  },
  strict: true,
}

serve(async (req) => {
  let cv_id: string | null = null

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { cv_id: bodyCvId }: CVProcessRequest = await req.json()

    cv_id = bodyCvId ?? null

    if (!cv_id) {
      return new Response(
        JSON.stringify({ error: "cv_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Supabase client (service role - admin yetkileri)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // CV kaydını al
    const { data: cv, error: cvError } = await supabase
      .from("cvs")
      .select("*")
      .eq("id", cv_id)
      .single()

    if (cvError || !cv) {
      return new Response(
        JSON.stringify({ error: "CV not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    console.log("CV Process: fetched CV record", {
      cv_id,
      status: cv.status,
    })

    // Bu katman sadece raw_text üzerinden çalışır; PDF parsing başka bir yerde yapılmalıdır
    const rawText = typeof cv.raw_text === "string" ? cv.raw_text.trim() : ""

    if (!rawText) {
      console.error("CV Process: raw_text is missing for CV", { cv_id })
      return new Response(
        JSON.stringify({ error: "raw_text is required for CV processing" }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    let cvText = rawText

    if (cvText.length > MAX_CV_TEXT_LENGTH) {
      console.log("CV Process: truncating CV text for token/cost control", {
        cv_id,
        originalLength: cvText.length,
        truncatedLength: MAX_CV_TEXT_LENGTH,
      })
      cvText = cvText.slice(0, MAX_CV_TEXT_LENGTH)
    }

    // OpenAI API ile CV parsing
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set")
    }

    console.log("CV Process: calling OpenAI Chat Completions for CV parsing", {
      cv_id,
      textLength: cvText.length,
    })

    const parsePrompt = `You are an ATS (Applicant Tracking System).
Extract structured information from the following CV text.
Return only the requested JSON fields, no explanations.

Fields:
- skills: array of strings (e.g., ["JavaScript", "React", "Node.js"])
- experience_years: number (total years of experience, approximate if needed)
- roles: array of strings (e.g., ["Frontend Developer", "Full Stack Developer"])
- seniority: one of "junior", "mid", or "senior"
- summary: max 3 sentences describing the candidate in neutral tone

CV TEXT:
${cvText}`

    const endpoint = "https://api.openai.com/v1/chat/completions"
    const baseHeaders = {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    }
    const baseMessages = [
      {
        role: "system",
        content:
          "You are a CV parsing system. Always return valid JSON only, no markdown, no explanations.",
      },
      {
        role: "user",
        content: parsePrompt,
      },
    ]

    // Önce structured output dene; bazı hesaplarda/politikalarda 400 dönerse fallback yap.
    let openaiResponse = await fetch(endpoint, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: baseMessages,
        response_format: {
          type: "json_schema",
          json_schema: CV_JSON_SCHEMA,
        },
        temperature: 0,
      }),
    })

    let responseText = await openaiResponse.text().catch(() => "Unknown error")

    if (!openaiResponse.ok && openaiResponse.status === 400) {
      console.warn("OpenAI structured output request returned 400, trying fallback", {
        cv_id,
        body: responseText,
      })

      openaiResponse = await fetch(endpoint, {
        method: "POST",
        headers: baseHeaders,
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            baseMessages[0],
            {
              role: "user",
              content:
                `${parsePrompt}\n\nReturn ONLY a valid JSON object with these keys: skills, experience_years, roles, seniority, summary.`,
            },
          ],
          temperature: 0,
        }),
      })

      responseText = await openaiResponse.text().catch(() => "Unknown error")
    }

    if (!openaiResponse.ok) {
      console.error("OpenAI API error response", {
        status: openaiResponse.status,
        body: responseText,
      })
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${responseText}`)
    }

    let openaiData: { choices?: Array<{ message?: { content?: string } }> }
    try {
      openaiData = JSON.parse(responseText)
    } catch {
      throw new Error("OpenAI response was not JSON")
    }

    const content = openaiData?.choices?.[0]?.message?.content
    let parsedData: any

    try {
      if (typeof content === "string") {
        const trimmed = content.trim()
        const jsonOnly = trimmed
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/, "")
          .trim()

        try {
          parsedData = JSON.parse(jsonOnly)
        } catch {
          const start = jsonOnly.indexOf("{")
          const end = jsonOnly.lastIndexOf("}")
          if (start >= 0 && end > start) {
            parsedData = JSON.parse(jsonOnly.slice(start, end + 1))
          } else {
            throw new Error("No JSON object found in model content")
          }
        }
      } else {
        throw new Error("Missing content in OpenAI response")
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response content", {
        cv_id,
        content,
        error: parseError,
      })
      throw new Error("Failed to parse OpenAI JSON output")
    }

    // Runtime validation / normalization
    const skills =
      Array.isArray(parsedData.skills) ?
        parsedData.skills.filter((s: unknown) => typeof s === "string")
      : []

    const experienceYears =
      typeof parsedData.experience_years === "number" && isFinite(parsedData.experience_years) ?
        parsedData.experience_years
      : null

    const roles =
      Array.isArray(parsedData.roles) ?
        parsedData.roles.filter((r: unknown) => typeof r === "string")
      : []

    const allowedSeniorities = new Set(["junior", "mid", "senior"])
    const seniority =
      typeof parsedData.seniority === "string" &&
      allowedSeniorities.has(parsedData.seniority) ?
        parsedData.seniority
      : null

    const summary = typeof parsedData.summary === "string" ? parsedData.summary : null

    parsedData = {
      skills,
      experience_years: experienceYears,
      roles,
      seniority,
      summary,
    }

    // CV profile oluştur veya güncelle
    const { data: existingProfile } = await supabase
      .from("cv_profiles")
      .select("id")
      .eq("cv_id", cv_id)
      .single()

    const profileData = {
      cv_id,
      skills: parsedData.skills,
      experience_years: parsedData.experience_years,
      roles: parsedData.roles,
      seniority: parsedData.seniority,
      summary: parsedData.summary,
    }

    if (existingProfile) {
      // Güncelle
      const { error: updateError } = await supabase
        .from("cv_profiles")
        .update(profileData)
        .eq("cv_id", cv_id)

      if (updateError) throw updateError
    } else {
      // Yeni oluştur
      const { error: insertError } = await supabase
        .from("cv_profiles")
        .insert(profileData)

      if (insertError) throw insertError
    }

    // CV status'u güncelle
    const { error: statusError } = await supabase
      .from("cvs")
      .update({
        status: "processed",
        raw_text: cvText,
        parsed_data: parsedData,
      })
      .eq("id", cv_id)

    if (statusError) {
      console.error("CV Process: failed to update CV status to processed", {
        cv_id,
        error: statusError,
      })
      throw statusError
    }

    console.log("CV Process: successfully processed CV", {
      cv_id,
      skillsCount: Array.isArray(parsedData.skills) ? parsedData.skills.length : 0,
    })

    // Developer skills artık kullanıcı "Profilime ekle" ile CV yükleme sayfasından ekliyor (öneri odaklı akış).

    return new Response(
      JSON.stringify({
        success: true,
        cv_id,
        profile: profileData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (err) {
    console.error("CV Process Error:", err)

    // Hata durumunda CV status'unu 'failed' yap
    try {
      if (cv_id) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        await supabase
          .from("cvs")
          .update({ status: "failed" })
          .eq("id", cv_id)
      } else {
        console.error("CV Process: cv_id is not available in error handler, skipping status update")
      }
    } catch (updateError) {
      console.error("Failed to update CV status:", updateError)
    }

    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

