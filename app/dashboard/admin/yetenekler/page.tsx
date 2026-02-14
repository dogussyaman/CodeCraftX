import { createClient } from "@/lib/supabase/server"
import { SkillsManager } from "./skills-manager"
import { Award } from "lucide-react"

export default async function SkillsPage() {
  const supabase = await createClient()

  // Order by created_at desc to show newest first, or name as before. 
  // Original was name ascending. Let's keep name ascending or use created_at if we want to see new ones.
  // I'll stick to name for better organization, or maybe just pass data.
  const { data: skills } = await supabase.from("skills").select("*").order("name", { ascending: true })

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Award className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Yetenek Yönetimi</h1>
            <p className="text-sm text-muted-foreground">Platform yetenekleri ve kategorileri</p>
          </div>
        </div>
      </div>

      <SkillsManager initialSkills={skills || []} />
    </div>
  )
}
