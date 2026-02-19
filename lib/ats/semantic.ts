import { createAdminClient } from "@/lib/supabase/admin"
import OpenAI from "openai"
import type { SemanticResult } from "./types"

const EMBEDDING_MODEL = "text-embedding-3-small"

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  return new OpenAI({ apiKey })
}

export async function computeSemanticScoreForApplication(params: {
  applicationId: string
  cvId: string | null
  jobId: string
}): Promise<SemanticResult> {
  const admin = createAdminClient()

  if (params.cvId) {
    const { data: cvProfile } = await admin
      .from("cv_profiles")
      .select("embedding")
      .eq("cv_id", params.cvId)
      .maybeSingle()
    const { data: jobRow } = await admin
      .from("job_postings")
      .select("embedding")
      .eq("id", params.jobId)
      .maybeSingle()

    const cvEmb = (cvProfile as { embedding?: number[] } | null)?.embedding ?? null
    const jobEmb = (jobRow as { embedding?: number[] } | null)?.embedding ?? null

    if (cvEmb && jobEmb) {
      const { data: simRow, error: simError } = await admin
        .rpc("cv_job_cosine_similarity", {
          p_cv_id: params.cvId,
          p_job_id: params.jobId,
        })

      if (!simError && typeof simRow === "number") {
        const cosine = simRow
        const score = Math.max(0, Math.min(1, cosine)) * 100
        return {
          cosineSimilarity: cosine,
          semanticScore: score,
          embeddingSource: "stored",
          modelUsed: EMBEDDING_MODEL,
        }
      }
    }
  }

  const openai = getOpenAIClient()
  if (!openai) {
    return {
      cosineSimilarity: null,
      semanticScore: 0,
      embeddingSource: null,
      modelUsed: null,
    }
  }

  const { data: job } = await admin
    .from("job_postings")
    .select("title, description, requirements, responsibilities")
    .eq("id", params.jobId)
    .maybeSingle()

  const { data: cv } = params.cvId
    ? await admin
        .from("cvs")
        .select("raw_text")
        .eq("id", params.cvId)
        .maybeSingle()
    : { data: null }

  const jobText = [
    (job as any)?.title,
    (job as any)?.description,
    (job as any)?.requirements,
    (job as any)?.responsibilities,
  ]
    .filter(Boolean)
    .join("\n\n")

  const cvText = ((cv as any)?.raw_text as string | null) ?? ""
  if (!jobText || !cvText) {
    return {
      cosineSimilarity: null,
      semanticScore: 0,
      embeddingSource: null,
      modelUsed: EMBEDDING_MODEL,
    }
  }

  const startedAt = performance.now()

  const [jobEmbeddingRes, cvEmbeddingRes] = await Promise.all([
    openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: jobText,
    }),
    openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: cvText,
    }),
  ])

  const latencyMs = Math.round(performance.now() - startedAt)

  const jobVec = jobEmbeddingRes.data[0]?.embedding ?? []
  const cvVec = cvEmbeddingRes.data[0]?.embedding ?? []

  const cosine = cosineSimilarity(jobVec, cvVec)
  const score = Math.max(0, Math.min(1, cosine)) * 100

  return {
    cosineSimilarity: cosine,
    semanticScore: score,
    embeddingSource: "generated",
    modelUsed: EMBEDDING_MODEL,
    tokensUsed:
      (jobEmbeddingRes.usage?.total_tokens ?? 0) +
      (cvEmbeddingRes.usage?.total_tokens ?? 0),
    latencyMs,
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  if (!na || !nb) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

