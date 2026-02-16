import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const EXPIRES_IN = 3600

/**
 * GET /api/cv/signed-url?applicationId=... or ?cv_id=...
 * Returns { url: string } for viewing/downloading CV. Supports path or legacy full-URL file_url.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const applicationId = searchParams.get("applicationId")
    const cvId = searchParams.get("cv_id")

    if (!applicationId && !cvId) {
      return NextResponse.json(
        { error: "applicationId or cv_id is required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let cvRow: { id: string; developer_id: string; file_url: string } | null = null

    if (cvId) {
      const { data, error } = await supabase
        .from("cvs")
        .select("id, developer_id, file_url")
        .eq("id", cvId)
        .single()
      if (error || !data) {
        return NextResponse.json({ error: "CV not found" }, { status: 404 })
      }
      cvRow = data as { id: string; developer_id: string; file_url: string }
      if (cvRow.developer_id !== user.id) {
        const { data: app } = await supabase
          .from("applications")
          .select("job_id")
          .eq("cv_id", cvId)
          .limit(1)
          .maybeSingle()
        if (app) {
          const { data: jp } = await supabase
            .from("job_postings")
            .select("company_id")
            .eq("id", (app as { job_id: string }).job_id)
            .single()
          const companyId = (jp as { company_id: string } | null)?.company_id
          const { data: profile } = await supabase
            .from("profiles")
            .select("company_id, role")
            .eq("id", user.id)
            .single()
          const p = profile as { company_id: string; role: string } | null
          const canAccess =
            p?.role === "platform_admin" ||
            p?.role === "admin" ||
            (p?.company_id === companyId && (p?.role === "hr" || p?.role === "company_admin" || p?.role === "company"))
          if (!canAccess) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
          }
        } else {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }
      }
    } else if (applicationId) {
      const { data: app, error: appError } = await supabase
        .from("applications")
        .select("id, cv_id, job_id")
        .eq("id", applicationId)
        .single()
      if (appError || !app) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 })
      }
      const a = app as { cv_id: string | null; job_id: string }
      if (!a.cv_id) {
        return NextResponse.json({ error: "No CV for this application" }, { status: 404 })
      }
      const { data: jp } = await supabase
        .from("job_postings")
        .select("company_id")
        .eq("id", a.job_id)
        .single()
      const companyId = (jp as { company_id: string } | null)?.company_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id, role")
        .eq("id", user.id)
        .single()
      const p = profile as { company_id: string; role: string } | null
      const canAccess =
        p?.role === "platform_admin" ||
        p?.role === "admin" ||
        (p?.company_id === companyId && (p?.role === "hr" || p?.role === "company_admin" || p?.role === "company"))
      if (!canAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      const { data: cv, error: cvError } = await supabase
        .from("cvs")
        .select("id, developer_id, file_url")
        .eq("id", a.cv_id)
        .single()
      if (cvError || !cv) {
        return NextResponse.json({ error: "CV not found" }, { status: 404 })
      }
      cvRow = cv as { id: string; developer_id: string; file_url: string }
    }

    if (!cvRow?.file_url) {
      return NextResponse.json({ error: "No file URL" }, { status: 404 })
    }

    let path = cvRow.file_url
    if (path.startsWith("http") && path.includes("/cvs/")) {
      const parts = path.split("/cvs/")
      path = parts[1] ?? path
    }

    let url: string
    try {
      const admin = createAdminClient()
      const { data: signed, error } = await admin.storage.from("cvs").createSignedUrl(path, EXPIRES_IN)
      if (error || !signed?.signedUrl) {
        console.error("createSignedUrl error", error)
        return NextResponse.json({ error: "Failed to create signed URL" }, { status: 500 })
      }
      url = signed.signedUrl
    } catch (e) {
      console.error("Admin client / signed URL error", e)
      return NextResponse.json({ error: "Failed to create signed URL" }, { status: 500 })
    }

    return NextResponse.json({ url })
  } catch (err) {
    console.error("signed-url error", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
