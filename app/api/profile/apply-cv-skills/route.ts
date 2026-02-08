import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type Body = { cv_id?: string; skill_names?: string[] }

/**
 * POST /api/profile/apply-cv-skills
 * Body: { cv_id: string } or { skill_names: string[] }
 * Adds suggested skills from CV to developer_skills (and creates skills if needed). User must own the CV if cv_id is used.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body
    const { cv_id, skill_names: rawNames } = body

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

    let skillNames: string[] = []

    if (cv_id) {
      const { data: cv, error } = await supabase
        .from("cvs")
        .select("id, developer_id, parsed_data")
        .eq("id", cv_id)
        .single()
      if (error || !cv) {
        return NextResponse.json(
          { success: false, error: "CV not found" },
          { status: 404 }
        )
      }
      if ((cv as { developer_id: string }).developer_id !== user.id) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 }
        )
      }
      const parsed = (cv as { parsed_data?: { skills?: string[] } }).parsed_data
      skillNames = Array.isArray(parsed?.skills) ? parsed.skills : []
      if (skillNames.length === 0) {
        const { data: profileRow } = await supabase
          .from("cv_profiles")
          .select("skills")
          .eq("cv_id", cv_id)
          .maybeSingle()
        const profSkills = (profileRow as { skills?: string[] } | null)?.skills
        skillNames = Array.isArray(profSkills) ? profSkills : []
      }
    } else if (Array.isArray(rawNames) && rawNames.length > 0) {
      skillNames = rawNames.map((s) => String(s).trim()).filter(Boolean)
    }

    if (skillNames.length === 0) {
      return NextResponse.json(
        { success: false, error: "No skills to add" },
        { status: 400 }
      )
    }

    const added: string[] = []
    for (const name of skillNames) {
      let { data: skill } = await supabase
        .from("skills")
        .select("id")
        .eq("name", name)
        .single()
      if (!skill) {
        const { data: newSkill } = await supabase
          .from("skills")
          .insert({ name, category: "other" })
          .select("id")
          .single()
        skill = newSkill
      }
      if (skill) {
        const { error: upsertErr } = await supabase
          .from("developer_skills")
          .upsert(
            {
              developer_id: user.id,
              skill_id: (skill as { id: string }).id,
              source: "cv",
            },
            { onConflict: "developer_id,skill_id" }
          )
        if (!upsertErr) added.push(name)
      }
    }

    return NextResponse.json({
      success: true,
      added,
      count: added.length,
    })
  } catch (err: unknown) {
    console.error("Apply CV skills error", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
