import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type Body = {
  interviewId: string
  selectedSlot?: string
}

/**
 * POST /api/applications/interview-confirm
 * Developer confirms participation: sets developer_selected_slot and developer_confirmed_at, notifies HR/company.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body
    const { interviewId, selectedSlot } = body
    if (!interviewId) {
      return NextResponse.json(
        { success: false, error: "interviewId is required" },
        { status: 400 }
      )
    }

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

    const { data: interview, error: intError } = await supabase
      .from("interviews")
      .select(
        `
        id,
        application_id,
        scheduled_by,
        proposed_date,
        proposed_time_slots,
        meet_link
      `
      )
      .eq("id", interviewId)
      .single()

    if (intError || !interview) {
      return NextResponse.json(
        { success: false, error: "Interview not found" },
        { status: 404 }
      )
    }

    const { data: application } = await supabase
      .from("applications")
      .select("developer_id, job_id")
      .eq("id", interview.application_id)
      .single()

    if (
      !application ||
      (application as { developer_id?: string }).developer_id !== user.id
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    const slot = selectedSlot?.trim() || null
    const { error: updateErr } = await supabase
      .from("interviews")
      .update({
        developer_selected_slot: slot,
        developer_confirmed_at: new Date().toISOString(),
      })
      .eq("id", interviewId)

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: updateErr.message },
        { status: 500 }
      )
    }

    const scheduledBy = (interview as { scheduled_by?: string }).scheduled_by
    const proposedDate = (interview as { proposed_date?: string }).proposed_date
    const bodyText = slot
      ? `Seçilen saat: ${slot}${proposedDate ? `, Tarih: ${proposedDate}` : ""}`
      : "Aday katılacağını onayladı."

    await supabase.from("notifications").insert({
      recipient_id: scheduledBy,
      actor_id: user.id,
      type: "interview_slot_confirmed",
      title: "Görüşme onayı",
      body: `Aday görüşmeye katılacağını onayladı. ${bodyText}`,
      href: "/dashboard/ik/basvurular",
      data: {
        application_id: interview.application_id,
        interview_id: interviewId,
        developer_selected_slot: slot,
        proposed_date: proposedDate,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error("Interview confirm error", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
