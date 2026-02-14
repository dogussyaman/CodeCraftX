import { createServerClient } from "@/lib/supabase/server"
import { CoverLetterList } from "./cover-letter-list"
import { redirect } from "next/navigation"

export default async function OnYazilarPage() {
    const supabase = await createServerClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/giris")
    }

    const { data: coverLetters } = await supabase
        .from("cover_letters")
        .select("*")
        .eq("developer_id", user.id)
        .order("is_favorite", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })

    return (
        <div className="container mx-auto min-h-screen px-4 py-8">
            <CoverLetterList initialCoverLetters={coverLetters || []} userId={user.id} />
        </div>
    )
}
