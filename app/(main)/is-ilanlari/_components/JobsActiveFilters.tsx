"use client"

import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

const WORK_PREFERENCE_LABELS: Record<string, string> = {
  "on-site": "İş Yerinde",
  remote: "Uzaktan",
  hybrid: "Hibrit",
}

const DATE_LABELS: Record<string, string> = {
  today: "Bugünün ilanları",
  "3h": "Son 3 saat",
  "8h": "Son 8 saat",
  "3d": "Son 3 gün",
  "7d": "Son 7 gün",
  "15d": "Son 15 gün",
}

const SORT_LABELS: Record<string, string> = {
  recommended: "Önerilen",
  "date-desc": "Tarihe göre (yeni)",
  "date-asc": "Tarihe göre (eski)",
}

export function JobsActiveFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const country = searchParams.get("country")
  const city = searchParams.get("city")
  const district = searchParams.get("district")
  const workPreference = searchParams.get("work_preference")
  const date = searchParams.get("date")
  const firstTime = searchParams.get("first_time") === "1"
  const experienceLevel = searchParams.get("experience_level")
  const jobType = searchParams.get("job_type")
  const sort = searchParams.get("sort")

  const chips: { key: string; label: string }[] = []
  if (country) chips.push({ key: "country", label: country })
  if (city) chips.push({ key: "city", label: city })
  if (district) chips.push({ key: "district", label: district })
  if (workPreference) chips.push({ key: "work_preference", label: WORK_PREFERENCE_LABELS[workPreference] ?? workPreference })
  if (date) chips.push({ key: "date", label: DATE_LABELS[date] ?? date })
  if (firstTime) chips.push({ key: "first_time", label: "İlk kez yayınlananlar" })
  if (experienceLevel) chips.push({ key: "experience_level", label: experienceLevel })
  if (jobType) chips.push({ key: "job_type", label: jobType === "full-time" ? "Tam Zamanlı" : jobType === "part-time" ? "Yarı Zamanlı" : jobType })

  const removeFilter = (key: string) => {
    const next = new URLSearchParams(searchParams.toString())
    next.delete(key)
    if (key === "first_time") next.delete("first_time")
    router.push(`/is-ilanlari?${next.toString()}`, { scroll: false })
  }

  const clearAll = () => {
    router.push("/is-ilanlari", { scroll: false })
  }

  if (chips.length === 0) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Seçili Filtreler ({chips.length}):</span>
      {chips.map(({ key, label }) => (
        <span
          key={`${key}-${label}`}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-3 py-1 text-sm"
        >
          {label}
          <button
            type="button"
            onClick={() => removeFilter(key)}
            className="rounded-full p-0.5 hover:bg-muted"
            aria-label={`${label} filtresini kaldır`}
          >
            <X className="size-3.5" />
          </button>
        </span>
      ))}
      <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground" onClick={clearAll} asChild>
        <Link href="/is-ilanlari">Filtreleri Temizle</Link>
      </Button>
    </div>
  )
}

export { SORT_LABELS }
