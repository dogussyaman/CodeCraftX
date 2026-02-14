import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Play } from "lucide-react"
import Link from "next/link"

export default async function MatchingPage() {
  const supabase = await createClient()

  // İşlenmiş CV'leri al
  const { data: processedCVs } = await supabase
    .from("cvs")
    .select(
      `
      *,
      profiles:developer_id (
        full_name,
        email
      )
    `,
    )
    .eq("status", "processed")

  // Aktif ilanları al
  const { data: activeJobs } = await supabase
    .from("job_postings")
    .select(
      `
      *,
      companies:company_id (
        name
      )
    `,
    )
    .eq("status", "active")

  // Son eşleşmeleri al
  const { data: recentMatches } = await supabase
    .from("matches")
    .select(
      `
      *,
      job_postings:job_id (
        title,
        companies:company_id (
          name
        )
      ),
      profiles:developer_id (
        full_name
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Zap className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Eşleştirme Sistemi</h1>
            <p className="text-sm text-muted-foreground">CV ve iş ilanı eşleştirmelerini yönetin</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/eslestirme/calistir">
            <Play className="mr-2 size-4" />
            Eşleştirme Çalıştır
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">İşlenmiş CV</p>
                <p className="text-3xl font-bold text-foreground mt-1">{processedCVs?.length || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Eşleştirmeye hazır</p>
              </div>
              <div className="rounded-xl bg-primary/10 p-2.5">
                <Zap className="size-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aktif İlan</p>
                <p className="text-3xl font-bold text-foreground mt-1">{activeJobs?.length || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Eşleştirmeye açık</p>
              </div>
              <div className="rounded-xl bg-green-500/10 p-2.5">
                <Zap className="size-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Eşleşme</p>
                <p className="text-3xl font-bold text-foreground mt-1">{recentMatches?.length || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Oluşturulan</p>
              </div>
              <div className="rounded-xl bg-muted p-2.5">
                <Zap className="size-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-5" />
            Son Eşleşmeler
          </CardTitle>
          <CardDescription>En son oluşturulan eşleşmeler</CardDescription>
        </CardHeader>
        <CardContent>
          {!recentMatches || recentMatches.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Henüz eşleşme yok</p>
              <p className="text-sm mt-1">Eşleştirme algoritmasını çalıştırın</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((match: any) => (
                <div key={match.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{match.profiles?.full_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {match.job_postings?.title} • {match.job_postings?.companies?.name}
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary">%{match.match_score}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
