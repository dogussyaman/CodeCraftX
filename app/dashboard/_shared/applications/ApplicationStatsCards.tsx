import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Sparkles, CalendarClock, Star } from "lucide-react"

interface ApplicationStatsCardsProps {
  totalApplications: number
  averageMatchScore: number | null
  interviewCount: number
  inMatchesCount: number
}

export function ApplicationStatsCards({
  totalApplications,
  averageMatchScore,
  interviewCount,
  inMatchesCount,
}: ApplicationStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card className="rounded-2xl border border-border bg-card shadow-sm dark:border-gray-600 dark:bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground dark:text-gray-400">Toplam Başvuru</p>
            <Users className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{totalApplications}</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border bg-card shadow-sm dark:border-gray-600 dark:bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground dark:text-gray-400">Ortalama ATS</p>
            <Sparkles className="size-4 text-primary" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-3xl font-semibold tabular-nums">{averageMatchScore != null ? `%${averageMatchScore}` : "-"}</p>
            {averageMatchScore != null ? <Badge variant="outline">AI</Badge> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border bg-card shadow-sm dark:border-gray-600 dark:bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground dark:text-gray-400">Süreçte</p>
            <CalendarClock className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{interviewCount}</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border bg-card shadow-sm dark:border-gray-600 dark:bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground dark:text-gray-400">Eşleşmede</p>
            <Star className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{inMatchesCount}</p>
        </CardContent>
      </Card>
    </div>
  )
}

