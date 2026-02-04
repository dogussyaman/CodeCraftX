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

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { cv_id }: CVProcessRequest = await req.json()

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

    // CV dosyasını Storage'dan indir
    // file_url formatı: https://xxx.supabase.co/storage/v1/object/public/cvs/path/to/file.pdf
    // Path'i çıkar: cvs/path/to/file.pdf -> path/to/file.pdf
    let filePath: string | null = null
    
    try {
      // Public URL'den path'i çıkar
      const urlParts = cv.file_url.split("/cvs/")
      if (urlParts.length > 1) {
        filePath = urlParts[1]
        // Query string varsa temizle
        if (filePath.includes("?")) {
          filePath = filePath.split("?")[0]
        }
      }
    } catch (parseError) {
      console.error("Failed to parse file_url:", parseError)
    }

    if (!filePath) {
      throw new Error("Failed to extract file path from file_url")
    }

    // Supabase Storage'dan dosyayı indir (service role ile)
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("cvs")
      .download(filePath)

    if (downloadError || !fileData) {
      console.error("Storage download error:", downloadError)
      throw new Error(`Failed to download CV file from storage: ${downloadError?.message || "Unknown error"}`)
    }

    // Blob'u ArrayBuffer'a çevir
    const fileBuffer = await fileData.arrayBuffer()

    // PDF/DOCX text extraction (basit versiyon - production'da pdf-parse veya mammoth kullanılmalı)
    // NOT: Deno'da PDF/DOCX parsing için uygun kütüphaneler yok, bu yüzden OpenAI'nin vision API'sini kullanabiliriz
    // veya text extraction için başka bir servis kullanılabilir
    // MVP için: Eğer raw_text zaten varsa onu kullan, yoksa OpenAI'ye gönder

    let cvText = cv.raw_text

    // Eğer raw_text yoksa, OpenAI'ye dosyayı gönder (vision API veya text extraction)
    if (!cvText) {
      // Basit yaklaşım: OpenAI'ye dosyayı gönder ve text extract et
      // NOT: Bu MVP için basitleştirilmiş - production'da pdf-parse veya mammoth kullanılmalı
      // Şimdilik: Kullanıcıdan raw_text bekliyoruz veya başka bir servis kullanılmalı
      
      // Geçici çözüm: OpenAI'ye prompt gönder (eğer dosya text formatındaysa)
      // Production'da: pdf-parse veya mammoth gibi kütüphaneler kullanılmalı
      
      cvText = "CV text extraction henüz implement edilmedi. Lütfen raw_text alanını manuel olarak doldurun."
    }

    // OpenAI API ile CV parsing
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set")
    }

    // Debug: API key yüklendi mi kontrolü (içerik taşımayan mesaj)
    console.log("OpenAI API key present:", Boolean(OPENAI_API_KEY))

    // GEÇİCİ: OpenAI quota sorunu çözülene kadar mock data kullan
    // TODO: OpenAI quota sorunu çözüldüğünde bu kısmı kaldır ve aşağıdaki OpenAI çağrısını aktif et
    const USE_MOCK_DATA = true // OpenAI çalıştığında bunu false yap

    let parsedData

    if (USE_MOCK_DATA) {
      // Mock data - OpenAI quota sorunu çözülene kadar
      console.log("Using mock data (OpenAI quota issue)")
      parsedData = {
        skills: ["JavaScript", "TypeScript", "React", "Node.js", "Next.js"],
        experience_years: 3,
        roles: ["Frontend Developer", "Full Stack Developer"],
        seniority: "mid",
        summary: "Experienced developer with strong skills in modern web technologies. Specialized in React and Node.js development."
      }
    } else {
      // Gerçek OpenAI çağrısı
      const parsePrompt = `You are an ATS (Applicant Tracking System) system.
Extract structured information from the CV text below.
Return ONLY valid JSON, no explanations.

Fields:
- skills: array of strings (e.g., ["JavaScript", "React", "Node.js"])
- experience_years: number (total years of experience)
- roles: array of strings (e.g., ["Frontend Developer", "Full Stack Developer"])
- seniority: one of "junior", "mid", or "senior"
- summary: max 3 sentences describing the candidate

CV TEXT:
${cvText}

Return JSON only:`

      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // veya "gpt-3.5-turbo" (daha ucuz)
          messages: [
            {
              role: "system",
              content: "You are a CV parsing system. Always return valid JSON only, no markdown, no explanations.",
            },
            {
              role: "user",
              content: parsePrompt,
            },
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      })

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.text()
        throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorData}`)
      }

      const openaiData = await openaiResponse.json()
      const parsedContent = openaiData.choices[0]?.message?.content

      if (!parsedContent) {
        throw new Error("OpenAI did not return content")
      }

      // JSON parse
      try {
        parsedData = JSON.parse(parsedContent)
      } catch (parseError) {
        throw new Error(`Failed to parse OpenAI response: ${parseError}`)
      }
    }

    // CV profile oluştur veya güncelle
    const { data: existingProfile } = await supabase
      .from("cv_profiles")
      .select("id")
      .eq("cv_id", cv_id)
      .single()

    const profileData = {
      cv_id,
      skills: parsedData.skills || [],
      experience_years: parsedData.experience_years || null,
      roles: parsedData.roles || [],
      seniority: parsedData.seniority || null,
      summary: parsedData.summary || null,
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

    if (statusError) throw statusError

    // Developer skills'i güncelle (cv_profiles'den)
    if (parsedData.skills && Array.isArray(parsedData.skills)) {
      // Skills tablosundan skill ID'lerini bul veya oluştur
      for (const skillName of parsedData.skills) {
        // Skill var mı kontrol et
        let { data: skill } = await supabase
          .from("skills")
          .select("id")
          .eq("name", skillName)
          .single()

        // Yoksa oluştur
        if (!skill) {
          const { data: newSkill } = await supabase
            .from("skills")
            .insert({ name: skillName, category: "other" })
            .select()
            .single()

          skill = newSkill
        }

        if (skill) {
          // Developer skill ekle (source: 'cv')
          await supabase
            .from("developer_skills")
            .upsert(
              {
                developer_id: cv.developer_id,
                skill_id: skill.id,
                source: "cv",
              },
              { onConflict: "developer_id,skill_id" }
            )
        }
      }
    }

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
  } catch (error) {
    console.error("CV Process Error:", error)

    // Hata durumunda CV status'unu 'failed' yap
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      const requestBody = await req.json().catch(() => ({}))
      const { cv_id } = requestBody as CVProcessRequest
      
      if (cv_id) {
        await supabase
          .from("cvs")
          .update({ status: "failed" })
          .eq("id", cv_id)
      }
    } catch (updateError) {
      console.error("Failed to update CV status:", updateError)
    }

    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
