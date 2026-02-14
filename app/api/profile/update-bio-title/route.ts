import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type Body = { bio?: string; title?: string }

/**
 * PATCH /api/profile/update-bio-title
 * Body: { bio?: string, title?: string }
 * Updates profiles.bio and/or profiles.title for the current user.
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as Body
    const { bio, title } = body

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

    const updates: { bio?: string; title?: string; updated_at: string } = {
      updated_at: new Date().toISOString(),
    }
    if (typeof bio === "string") updates.bio = bio
    if (typeof title === "string") updates.title = title

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error("Update bio/title error", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
