import { createAdminClient } from "@/lib/supabase/admin"
import type { AlgorithmWeights, ATSScore, ScoringBreakdown } from "./types"
import { computeRuleScore, buildScoringBreakdown } from "./scoring"
import { computeSemanticScoreForApplication } from "./semantic"

async function getActiveAlgorithmVersion(admin = createAdminClient()): Promise<{
  version: string
  weights: AlgorithmWeights
}> {
  const { data, error } = await admin
    .from("scoring_algorithm_versions")
    .select("version, weights")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) {
    return {
      version: "1.0.0",
      weights: {
        rule_weight: 0.6,
        semantic_weight: 0.4,
        skill_weight: 0.5,
        experience_weight: 0.25,
        education_weight: 0.15,
        optional_bonus_weight: 0.1,
      },
    }
  }

  const w = data.weights as Partial<AlgorithmWeights> | null

  return {
    version: data.version,
    weights: {
      rule_weight: w?.rule_weight ?? 0.6,
      semantic_weight: w?.semantic_weight ?? 0.4,
      skill_weight: w?.skill_weight ?? 0.5,
      experience_weight: w?.experience_weight ?? 0.25,
      education_weight: w?.education_weight ?? 0.15,
      optional_bonus_weight: w?.optional_bonus_weight ?? 0.1,
    },
  }
}

interface ComputeATSScoreOptions {
  forceRecalculate?: boolean
  algorithmVersion?: string
}

export async function computeATSScore(
  applicationId: string,
  options: ComputeATSScoreOptions = {},
): Promise<{ atsScore: ATSScore; breakdown: ScoringBreakdown }> {
  const admin = createAdminClient()

  const { data: app, error: appError } = await admin
    .from("applications")
    .select("id, job_id, developer_id, cv_id, match_details")
    .eq("id", applicationId)
    .single()

  if (appError || !app) {
    throw new Error("Application not found")
  }

  const jobId = app.job_id as string
  const developerId = app.developer_id as string
  const cvId = (app.cv_id as string | null) ?? null

  const { version: activeVersion, weights } = await getActiveAlgorithmVersion(admin)
  const algorithmVersion = options.algorithmVersion ?? activeVersion

  if (!options.forceRecalculate) {
    const { data: existing } = await admin
      .from("ats_scores")
      .select(
        `
        id,
        application_id,
        job_id,
        candidate_id,
        rule_score,
        semantic_score,
        final_score,
        scoring_breakdown,
        algorithm_version,
        status,
        error_message,
        calculated_at,
        created_at,
        updated_at
      `,
      )
      .eq("application_id", applicationId)
      .eq("algorithm_version", algorithmVersion)
      .maybeSingle()

    if (existing && existing.status === "completed") {
      return {
        atsScore: existing as ATSScore,
        breakdown: existing.scoring_breakdown as ScoringBreakdown,
      }
    }
  }

  const { ruleScore, components, positiveFactors, negativeFactors } = await computeRuleScore({
    jobId,
    developerId,
    cvId,
  })

  const semanticResult = await computeSemanticScoreForApplication({
    applicationId,
    cvId,
    jobId,
  })

  const semanticComponent: ScoringBreakdown["semantic"] = {
    cosine_similarity: semanticResult.cosineSimilarity,
    score: semanticResult.semanticScore,
    weight: weights.semantic_weight,
    weighted: semanticResult.semanticScore * weights.semantic_weight,
    model: semanticResult.modelUsed,
    source: semanticResult.embeddingSource,
  }

  const breakdown = buildScoringBreakdown({
    algorithmVersion,
    ruleScore,
    semanticScore: semanticResult.semanticScore,
    weights,
    components,
    semanticComponent,
    positiveFactors,
    negativeFactors,
  })

  const finalScore = breakdown.final_score

  const payload = {
    application_id: applicationId,
    job_id: jobId,
    candidate_id: developerId,
    rule_score: breakdown.rule_score,
    semantic_score: breakdown.semantic_score,
    final_score: finalScore,
    scoring_breakdown: breakdown,
    algorithm_version: algorithmVersion,
    status: "completed" as const,
    error_message: null,
    calculated_at: new Date().toISOString(),
  }

  const { data: upserted, error: upsertError } = await admin
    .from("ats_scores")
    .upsert(payload, {
      onConflict: "application_id,algorithm_version",
    })
    .select(
      `
      id,
      application_id,
      job_id,
      candidate_id,
      rule_score,
      semantic_score,
      final_score,
      scoring_breakdown,
      algorithm_version,
      status,
      error_message,
      calculated_at,
      created_at,
      updated_at
    `,
    )
    .single()

  if (upsertError || !upserted) {
    throw new Error(upsertError?.message ?? "ATS score upsert failed")
  }

  await admin
    .from("applications")
    .update({
      match_score: finalScore,
      match_details: app.match_details ?? breakdown,
      match_reason:
        finalScore >= 80
          ? "Aday, ATS skoruna göre pozisyon için çok güçlü bir eşleşme."
          : finalScore >= 60
            ? "Aday, ATS skoruna göre pozisyon için uygun bir eşleşme."
            : "Aday, ATS skoruna göre pozisyon gereksinimleriyle sınırlı uyum gösteriyor.",
    })
    .eq("id", applicationId)

  const { data: logError } = await admin
    .from("ai_matching_logs")
    .insert({
      ats_score_id: upserted.id,
      application_id: applicationId,
      model_used: semanticResult.modelUsed ?? "unknown",
      cv_embedding_source: semanticResult.embeddingSource ?? null,
      job_embedding_source: semanticResult.embeddingSource ?? null,
      cosine_similarity: semanticResult.cosineSimilarity,
      semantic_score: semanticResult.semanticScore,
      tokens_used: semanticResult.tokensUsed ?? null,
      latency_ms: semanticResult.latencyMs ?? null,
      error_message: null,
    })
    .select()

  if (logError) {
    // log insert hatası sistemin çalışmasını engellemesin
  }

  return {
    atsScore: upserted as ATSScore,
    breakdown,
  }
}

export async function recalculateJobScores(jobId: string, options?: { algorithmVersion?: string; batchSize?: number }) {
  const admin = createAdminClient()
  const batchSize = options?.batchSize ?? 10

  const { data: applications, error } = await admin
    .from("applications")
    .select("id")
    .eq("job_id", jobId)

  if (error || !applications) {
    throw new Error("Applications not found for job")
  }

  const ids = applications.map((a) => a.id as string)
  const processed: string[] = []
  const errors: { applicationId: string; error: string }[] = []

  for (let i = 0; i < ids.length; i += batchSize) {
    const chunk = ids.slice(i, i + batchSize)
    const promises = chunk.map(async (id) => {
      try {
        await computeATSScore(id, {
          forceRecalculate: true,
          algorithmVersion: options?.algorithmVersion,
        })
        processed.push(id)
      } catch (err) {
        errors.push({
          applicationId: id,
          error: err instanceof Error ? err.message : "Unknown error",
        })
      }
    })
    await Promise.all(promises)
  }

  return { processed, errors }
}

