"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, Clock, MapPin } from "lucide-react"

interface JobsListProps {
  ilanlar: any[] | null
  count: number
  pageTitle: string
  sort: string
}

const jobTypeLabel: Record<string, string> = {
  "full-time": "Tam Zamanlı",
  "part-time": "Yarı Zamanlı",
  contract: "Sözleşmeli",
  internship: "Staj",
  freelance: "Freelance",
}

const workPreferenceLabel: Record<string, string> = {
  "on-site": "İş Yerinde",
  remote: "Uzaktan",
  hybrid: "Hibrit",
}

const SORT_OPTIONS = [
  { value: "recommended", label: "Önerilen" },
  { value: "date-desc", label: "Tarihe göre (yeni → eski)" },
  { value: "date-asc", label: "Tarihe göre (eski → yeni)" },
]

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000))
  if (diffDays >= 1) return `${diffDays} gün`
  if (diffHours >= 1) return `${diffHours} saat`
  const diffMins = Math.floor(diffMs / (60 * 1000))
  return diffMins < 1 ? "Az önce" : `${diffMins} dakika`
}

function getWorkPreferenceDisplay(ilan: any): string {
  const list = Array.isArray(ilan.work_preference_list) && ilan.work_preference_list.length > 0
    ? ilan.work_preference_list
    : ilan.work_preference
      ? [ilan.work_preference]
      : []
  if (list.length === 0) return ""
  return list.map((w: string) => workPreferenceLabel[w] ?? w).join(", ")
}

function getLocationDisplay(ilan: any): string {
  const parts: string[] = []
  if (ilan.city) parts.push(ilan.city)
  else if (ilan.location) parts.push(ilan.location)
  const wp = getWorkPreferenceDisplay(ilan)
  if (wp) parts.push(wp)
  return parts.join(" • ")
}

export function JobsList({ ilanlar, count, pageTitle, sort }: JobsListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setSort = (value: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (value && value !== "recommended") next.set("sort", value)
    else next.delete("sort")
    router.push(`/is-ilanlari?${next.toString()}`, { scroll: false })
  }

  return (
    <section className="mt-4 pb-12 md:pb-16">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:mb-4">
        <h2 className="text-xl font-semibold">{pageTitle}</h2>
        <Select value={sort || "date-desc"} onValueChange={setSort}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Sırala" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 md:space-y-5">
        {ilanlar && ilanlar.length > 0 ? (
          ilanlar.map((ilan: any) => {
            const locationDisplay = getLocationDisplay(ilan)
            return (
              <Card
                key={ilan.id}
                className="rounded-xl border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 overflow-hidden"
              >
                <Link href={`/is-ilanlari/${ilan.id}`} className="block">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex gap-4 flex-1 min-w-0">
                        <div className="size-12 shrink-0 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                          {ilan.companies?.logo_url ? (
                            <img
                              src={ilan.companies.logo_url}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-semibold text-muted-foreground">
                              {(ilan.companies?.name ?? "?").charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg font-semibold hover:text-primary transition-colors mb-2 line-clamp-1">
                            {ilan.title}
                          </CardTitle>
                          <CardDescription className="space-y-1.5 text-sm">
                            <div className="flex items-center gap-2">
                              <Building2 className="size-4 shrink-0" />
                              <span className="line-clamp-1">{ilan.companies?.name}</span>
                            </div>
                            {locationDisplay && (
                              <div className="flex items-center gap-2">
                                <MapPin className="size-4 shrink-0" />
                                <span>{locationDisplay}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              {ilan.job_type && (
                                <span className="text-muted-foreground">
                                  {jobTypeLabel[ilan.job_type] ?? ilan.job_type}
                                </span>
                              )}
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="size-3" />
                                {formatTimeAgo(ilan.created_at)}
                              </span>
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                      <span className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shrink-0 md:mt-0">
                        Detay
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {ilan.job_skills?.slice(0, 5).map((js: any, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs rounded-md font-normal">
                          {js.skills?.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-16 rounded-xl border border-dashed border-border bg-muted/30">
            <p className="text-muted-foreground">Bu kriterlere uygun ilan bulunmuyor.</p>
            <p className="text-sm text-muted-foreground mt-1">Farklı filtreler deneyebilirsiniz.</p>
          </div>
        )}
      </div>
    </section>
  )
}
