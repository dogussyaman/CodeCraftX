import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Briefcase, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function MatchesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: matches } = await supabase
    .from("matches")
    .select(
      `
      *,
      job_postings:job_id (
        id,
        title,
        description,
        location,
        job_type,
        experience_level,
        companies:company_id (
          name,
          logo_url
        )
      )
    `,
    )
    .eq("developer_id", user!.id)
    .order("match_score", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Eşleşmeler</h1>
        <p className="text-muted-foreground">Size uygun bulunan iş pozisyonları</p>
      </div>

      {!matches || matches.length === 0 ? (
        <Card className="border-dashed bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Star className="size-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Henüz eşleşme yok</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              CV yüklediğinizde yapay zeka size uygun pozisyonları bulacak
            </p>
            <Button asChild>
              <Link href="/dashboard/gelistirici/cv">CV Yükle</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {matches.map((match: any) => (
            <Card key={match.id} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{match.job_postings?.title}</CardTitle>
                      <Badge className="bg-primary/10 text-primary">
                        <TrendingUp className="mr-1 size-3" />%{match.match_score} Uyumlu
                      </Badge>
                    </div>
                    <CardDescription className="text-base">{match.job_postings?.companies?.name}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{match.job_postings?.description}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {match.job_postings?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {match.job_postings.location}
                    </div>
                  )}
                  {match.job_postings?.job_type && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="size-4" />
                      <span className="capitalize">{match.job_postings.job_type.replace("-", " ")}</span>
                    </div>
                  )}
                  {match.job_postings?.experience_level && (
                    <Badge variant="outline" className="capitalize">
                      {match.job_postings.experience_level}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button asChild className="flex-1">
                    <Link href={`/dashboard/gelistirici/eslesmeler/${match.job_postings.id}`}>Pozisyon Detayları</Link>
                  </Button>
                  <Button variant="outline">Başvur</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
