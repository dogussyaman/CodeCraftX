import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type Body = { cv_id?: string; skill_names?: string[] }

/**
 * POST /api/profile/apply-cv-skills
 * Body: { cv_id: string } or { skill_names: string[] }
 * Adds suggested skills from CV to developer_skills.
 * Uses admin client for skill creation (bypasses RLS) to support arbitrary skill names.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body
    const { cv_id, skill_names: rawNames } = body

    const supabase = await createClient()
    const admin = createAdminClient()

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
    const failed: string[] = []

    for (const name of skillNames) {
      try {
        // Case-insensitive arama: "SASS" vs "Sass" gibi farklılıkları yakala
        let { data: skill } = await admin
          .from("skills")
          .select("id, name")
          .ilike("name", name)
          .limit(1)
          .maybeSingle()

        if (!skill) {
          const { data: newSkill, error: insertErr } = await admin
            .from("skills")
            .insert({ name, category: "other" })
            .select("id, name")
            .single()
          if (insertErr) {
            console.error("apply-cv-skills: failed to create skill", { name, error: insertErr })
            failed.push(name)
            continue
          }
          skill = newSkill
        }

        if (!skill) {
          failed.push(name)
          continue
        }

        const skillId = (skill as { id: string }).id

        const { data: existing } = await admin
          .from("developer_skills")
          .select("id")
          .eq("developer_id", user.id)
          .eq("skill_id", skillId)
          .maybeSingle()

        if (existing) {
          added.push((skill as { name: string }).name)
          continue
        }

        const { error: insertErr2 } = await admin
          .from("developer_skills")
          .insert({
            developer_id: user.id,
            skill_id: skillId,
            source: "cv",
          })
        if (insertErr2) {
          console.error("apply-cv-skills: failed to insert developer_skill", { name, error: insertErr2 })
          failed.push(name)
        } else {
          added.push((skill as { name: string }).name)
        }
      } catch (err) {
        console.error("apply-cv-skills: unexpected error for skill", { name, err })
        failed.push(name)
      }
    }

    return NextResponse.json({
      success: true,
      added,
      failed,
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
