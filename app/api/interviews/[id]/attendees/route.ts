import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * PATCH /api/interviews/[id]/attendees
 * Görüşmeye davet edilen İK katılımcılarını günceller (invited_attendee_ids).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: interviewId } = await params
    if (!interviewId) {
      return NextResponse.json(
        { success: false, error: "Interview ID required" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const raw = body.invited_attendee_ids
    const invited_attendee_ids = Array.isArray(raw)
      ? raw.filter((x: unknown) => typeof x === "string").slice(0, 50)
      : []

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: interview, error: fetchErr } = await supabase
      .from("interviews")
      .select("id, application_id")
      .eq("id", interviewId)
      .single()

    if (fetchErr || !interview) {
      return NextResponse.json(
        { success: false, error: "Interview not found" },
        { status: 404 }
      )
    }

    const { data: app } = await supabase
      .from("applications")
      .select("job_id")
      .eq("id", interview.application_id)
      .single()

    if (!app) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      )
    }

    const { data: job } = await supabase
      .from("job_postings")
      .select("company_id")
      .eq("id", app.job_id)
      .single()

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      )
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .single()

    const profileRow = profile as { company_id?: string; role?: string } | null
    const isCompany =
      profileRow?.company_id === job.company_id ||
      (await supabase
        .from("companies")
        .select("id")
        .or(`owner_profile_id.eq.${user.id},created_by.eq.${user.id}`)
        .eq("id", job.company_id)
        .maybeSingle()
        .then(({ data }) => !!data?.id))
    const isHr = profileRow?.role === "hr" && profileRow?.company_id === job.company_id
    const isAdmin = profileRow?.role === "admin" || profileRow?.role === "platform_admin"

    if (!isCompany && !isHr && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    const { error: updateErr } = await supabase
      .from("interviews")
      .update({ invited_attendee_ids })
      .eq("id", interviewId)

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: updateErr.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Interview attendees update error", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
