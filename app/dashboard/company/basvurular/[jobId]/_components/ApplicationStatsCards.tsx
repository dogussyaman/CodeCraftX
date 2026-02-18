"use client"

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
      {/* İlk kart: referans görseldeki mor vurgulu "Total Applications" kartı */}
      <Card className="rounded-2xl border-0 bg-card text-white shadow-md">
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="size-5 text-primary" />
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Toplam başvuru
            </span>
          </div>
          <div className="text-3xl font-bold tabular-nums text-foreground">
            {totalApplications}
          </div>
          <p className="text-xs text-muted-foreground">
            Bu ilana gelen tüm başvurulara genel bakış
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border/80 bg-card shadow-sm">
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-violet-500/10">
                <Sparkles className="size-4 text-violet-500" />
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                AI uyum oranı
              </span>
            </div>
            {averageMatchScore != null && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                AI destekli
              </Badge>
            )}
          </div>
          <div className="text-2xl font-semibold tabular-nums text-foreground">
            {averageMatchScore != null ? `%${averageMatchScore}` : "-"}
          </div>
          <p className="text-xs text-muted-foreground">
            Bu ilana gelen tüm başvuruların AI uyum oranlarının ortalaması
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border/80 bg-card shadow-sm">
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10">
                <CalendarClock className="size-4 text-amber-500" />
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Süreçte (görüşme)
              </span>
            </div>
          </div>
          <div className="text-2xl font-semibold tabular-nums text-foreground">
            {interviewCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Bu ilana gelen tüm başvuruların süreçte (görüşme) sayısı
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border/80 bg-card shadow-sm">
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10">
                <Star className="size-4 text-emerald-500" />
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Eşleşmelere eklenen
              </span>
            </div>
            <p className="text-xs text-muted-foreground"></p>
          </div>
          <div className="text-2xl font-semibold tabular-nums text-foreground">
            {inMatchesCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Bu ilana gelen tüm başvuruların eşleşmelere eklenen sayısı
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

