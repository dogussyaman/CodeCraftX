import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

export default async function HRMatchesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user!.id)
    .single()

  // Şirketin ilanlarını al
  const { data: myJobs } = await supabase
    .from("job_postings")
    .select("id")
    .eq("company_id", profile?.company_id ?? "")

  const jobIds = myJobs?.map((job) => job.id) || []

  // Bu ilanlara ait eşleşmeleri al
  const { data: matches } = await supabase
    .from("matches")
    .select(
      `
      *,
      job_postings:job_id (
        title,
        location
      ),
      profiles:developer_id (
        full_name,
        email
      )
    `,
    )
    .in("job_id", jobIds.length > 0 ? jobIds : [""])
    .order("match_score", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Star className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Eşleşmeler</h1>
            <p className="text-sm text-muted-foreground">İş ilanlarınıza uygun bulunan adaylar</p>
          </div>
        </div>
      </div>

      {!matches || matches.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border bg-muted/30 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Star className="size-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Henüz eşleşme yok</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Geliştiriciler CV yükledikçe ilanlarınıza uygun adaylar burada görünecek
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {matches.map((match: any) => (
            <Card key={match.id} className="rounded-2xl border border-border bg-card shadow-sm hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{match.profiles?.full_name}</CardTitle>
                    <CardDescription className="mt-1">
                      {match.job_postings?.title} • {match.job_postings?.location}
                    </CardDescription>
                  </div>
                  <Badge className="bg-primary/10 text-primary">%{match.match_score} Uyumlu</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">{match.profiles?.email}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
