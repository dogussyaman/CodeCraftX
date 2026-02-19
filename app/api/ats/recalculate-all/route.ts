import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { recalculateJobScores } from "@/lib/ats/service"

/**
 * POST /api/ats/recalculate-all
 * Tüm ilanlar için ATS skorlarını yeniler. CRON_SECRET veya ADMIN_SECRET ile korunur.
 * Body: { jobIds?: string[] } — boşsa tüm ilanlar, verilirse sadece bu id'ler.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET ?? process.env.ADMIN_SECRET
    const authHeader = req.headers.get("authorization")
    const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
    if (!secret || bearer !== secret) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json().catch(() => ({}))) as { jobIds?: string[] }
    const admin = createAdminClient()

    let jobIds: string[]
    if (body.jobIds?.length) {
      jobIds = body.jobIds
    } else {
      const { data: jobs, error } = await admin
        .from("job_postings")
        .select("id")
      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 },
        )
      }
      jobIds = (jobs ?? []).map((j) => j.id as string)
    }

    const results: { jobId: string; processed: number; errors: number }[] = []
    for (const jobId of jobIds) {
      const { processed, errors } = await recalculateJobScores(jobId, { batchSize: 10 })
      results.push({
        jobId,
        processed: processed.length,
        errors: errors.length,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        total_jobs: jobIds.length,
        results,
      },
    })
  } catch (err: unknown) {
    console.error("ATS recalculate-all error", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
