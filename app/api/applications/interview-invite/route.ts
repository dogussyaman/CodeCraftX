import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type Body = {
  applicationId: string
  meetLink?: string
  proposedDate?: string
  proposedTimeSlots?: string[]
}

/**
 * POST /api/applications/interview-invite
 * Creates or updates interview for application (Meet link or date+slots), updates status to interview, notifies developer.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body
    const { applicationId, meetLink, proposedDate, proposedTimeSlots } = body
    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "applicationId is required" },
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

    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(
        `
        id,
        developer_id,
        job_id,
        job_postings:job_id ( title )
      `
      )
      .eq("id", applicationId)
      .single()

    if (appError || !application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      )
    }

    const jobTitle =
      (application.job_postings as { title?: string } | null)?.title || "İlan"
    const developerId = application.developer_id

    const { data: jobRow } = await supabase
      .from("job_postings")
      .select("company_id")
      .eq("id", application.job_id)
      .single()
    const jobCompanyId = (jobRow as { company_id?: string } | null)?.company_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .single()
    const profileCompany = (profile as { company_id?: string } | null)?.company_id
    const role = (profile as { role?: string } | null)?.role
    const isCompany =
      jobCompanyId === profileCompany ||
      (await supabase
        .from("companies")
        .select("id")
        .or(`owner_profile_id.eq.${user.id},created_by.eq.${user.id}`)
        .eq("id", jobCompanyId)
        .maybeSingle()
        .then(({ data }) => !!data?.id))
    const isHr = role === "hr" && profileCompany === jobCompanyId
    const isAdmin = role === "admin" || role === "platform_admin"
    if (!isCompany && !isHr && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    const proposedDateVal =
      proposedDate && proposedDate.trim()
        ? new Date(proposedDate + "T12:00:00Z").toISOString().slice(0, 10)
        : null
    const slots =
      Array.isArray(proposedTimeSlots) && proposedTimeSlots.length > 0
        ? proposedTimeSlots
        : []

    const scheduledAt = proposedDateVal
      ? new Date(`${proposedDateVal}T${(slots[0] || "09:00").slice(0, 5)}:00`).toISOString()
      : new Date().toISOString()

    const { data: existingInterview } = await supabase
      .from("interviews")
      .select("id")
      .eq("application_id", applicationId)
      .in("status", ["scheduled", "rescheduled"])
      .maybeSingle()

    const interviewRow = {
      application_id: applicationId,
      scheduled_by: user.id,
      interview_type: "video",
      title: `${jobTitle} - Görüşme`,
      scheduled_at: scheduledAt,
      meet_link: meetLink?.trim() || null,
      proposed_date: proposedDateVal,
      proposed_time_slots: slots,
      status: "scheduled",
    }

    if (existingInterview?.id) {
      const { error: upErr } = await supabase
        .from("interviews")
        .update(interviewRow)
        .eq("id", existingInterview.id)
      if (upErr) {
        return NextResponse.json(
          { success: false, error: upErr.message },
          { status: 500 }
        )
      }
    } else {
      const { error: insErr } = await supabase
        .from("interviews")
        .insert(interviewRow)
      if (insErr) {
        return NextResponse.json(
          { success: false, error: insErr.message },
          { status: 500 }
        )
      }
    }

    await supabase
      .from("applications")
      .update({ status: "interview" })
      .eq("id", applicationId)

    const bodyText = meetLink
      ? `Meet linki: ${meetLink}`
      : proposedDateVal && slots.length > 0
        ? `Tarih: ${proposedDateVal}, Saat seçenekleri: ${slots.join(", ")}`
        : "Detaylar için başvurularınız sayfasını kontrol edin."

    await supabase.from("notifications").insert({
      recipient_id: developerId,
      actor_id: user.id,
      type: "interview_invitation",
      title: "Görüşme daveti",
      body: `${jobTitle} pozisyonu için görüşme daveti aldınız. ${bodyText}`,
      href: "/dashboard/gelistirici/basvurular",
      data: {
        application_id: applicationId,
        job_title: jobTitle,
        meet_link: meetLink || null,
        proposed_date: proposedDateVal,
        proposed_time_slots: slots,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error("Interview invite error", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
