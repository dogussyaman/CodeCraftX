import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type Body = {
  applicationIds: string[]
  templateId?: string
  message?: string
}

/**
 * POST /api/applications/bulk-reject
 * Rejects multiple applications with the same message/template and notifies developers.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body
    const { applicationIds, templateId, message } = body
    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "applicationIds array is required" },
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

    let bodyText = message?.trim() || ""
    if (templateId && !bodyText) {
      const { data: t } = await supabase
        .from("feedback_templates")
        .select("body")
        .eq("id", templateId)
        .single()
      if (t) bodyText = (t as { body: string }).body
    }
    if (!bodyText) {
      bodyText = "Başvurunuz değerlendirildi. Bu pozisyon için uygun bulunmadınız."
    }

    const { data: applications } = await supabase
      .from("applications")
      .select("id, developer_id, job_id, job_postings:job_id(title)")
      .in("id", applicationIds)

    if (!applications?.length) {
      return NextResponse.json(
        { success: false, error: "No applications found" },
        { status: 404 }
      )
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id, role")
      .eq("id", user.id)
      .single()
    const companyId = (profile as { company_id?: string } | null)?.company_id
    const role = (profile as { role?: string } | null)?.role

    for (const app of applications) {
      const job = (app as { job_postings?: { title?: string } }).job_postings
      const jobTitle = (job && !Array.isArray(job) ? job.title : null) || "İlan"
      const { data: jp } = await supabase
        .from("job_postings")
        .select("company_id")
        .eq("id", app.job_id)
        .single()
      const jCompanyId = (jp as { company_id?: string } | null)?.company_id
      const allowed =
        role === "admin" ||
        role === "platform_admin" ||
        (companyId === jCompanyId) ||
        (role === "hr" && companyId === jCompanyId)
      if (!allowed) continue

      await supabase
        .from("applications")
        .update({ status: "rejected" })
        .eq("id", app.id)

      await supabase.from("application_notes").insert({
        application_id: app.id,
        created_by: user.id,
        note_type: "general",
        content: bodyText,
        is_visible_to_developer: true,
      })

      await supabase.from("notifications").insert({
        recipient_id: app.developer_id,
        actor_id: user.id,
        type: "application_status_changed",
        title: "Başvurunuz reddedildi",
        body: `${jobTitle} pozisyonu için başvurunuz reddedildi.`,
        href: "/dashboard/gelistirici/basvurular",
        data: { application_id: app.id, job_title: jobTitle },
      })
    }

    return NextResponse.json({ success: true, count: applications.length })
  } catch (err: unknown) {
    console.error("Bulk reject error", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
