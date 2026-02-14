import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * POST /api/applications/cv-download
 * Body: { applicationId: string }
 * Records CV download and sends notification to developer.
 * Caller must be HR or company with access to the application's job.
 */
export async function POST(req: NextRequest) {
  try {
    const { applicationId } = (await req.json()) as { applicationId?: string }
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, company_id")
      .eq("id", user.id)
      .single()

    const job = (application as { job_postings?: { title?: string } | null })
      .job_postings
    const jobTitle =
      (job && !Array.isArray(job) ? job.title : null) || "İlan"
    const companyId = (profile as { company_id?: string } | null)?.company_id
    const role = (profile as { role?: string } | null)?.role

    const { data: jobRow } = await supabase
      .from("job_postings")
      .select("company_id")
      .eq("id", application.job_id)
      .single()

    const jobCompanyId = (jobRow as { company_id?: string } | null)?.company_id
    const isCompanyOwner = await (async () => {
      const { data: c } = await supabase
        .from("companies")
        .select("id")
        .or(`owner_profile_id.eq.${user.id},created_by.eq.${user.id}`)
        .eq("id", jobCompanyId)
        .maybeSingle()
      return !!c
    })()
    const isHrForCompany =
      role === "hr" && companyId === jobCompanyId
    const isAdmin =
      role === "admin" || role === "platform_admin"
    if (!isCompanyOwner && !isHrForCompany && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    const { error: insertError } = await supabase.from("cv_downloads").insert({
      application_id: applicationId,
      downloaded_by: user.id,
    })

    if (insertError) {
      console.error("cv_downloads insert error", insertError)
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      )
    }

    const developerId = application.developer_id
    const { error: notifError } = await supabase.from("notifications").insert({
      recipient_id: developerId,
      actor_id: user.id,
      type: "cv_downloaded",
      title: "CV'niz indirildi",
      body: `${jobTitle} pozisyonu için başvurduğunuz CV'niz şirket tarafından indirildi.`,
      href: "/dashboard/gelistirici/basvurular",
      data: { application_id: applicationId, job_title: jobTitle },
    })

    if (notifError) {
      console.error("Notification insert error", notifError)
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error("CV download record error", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
