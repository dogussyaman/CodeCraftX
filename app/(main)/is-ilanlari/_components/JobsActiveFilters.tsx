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

const EXPERIENCE_LABELS: Record<string, string> = {
  junior: "Junior",
  mid: "Mid-Level",
  senior: "Senior",
  lead: "Lead",
}

const JOB_TYPE_LABELS: Record<string, string> = {
  "full-time": "Tam Zamanlı",
  "part-time": "Yarı Zamanlı",
  contract: "Sözleşmeli",
  internship: "Staj",
  freelance: "Freelance",
}

const SORT_LABELS: Record<string, string> = {
  recommended: "Önerilen",
  "date-desc": "Tarihe göre (yeni)",
  "date-asc": "Tarihe göre (eski)",
}

type Chip = { key: string; label: string; value?: string }

export function JobsActiveFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const country = searchParams.get("country")
  const city = searchParams.get("city")
  const district = searchParams.get("district")
  const workPreferenceRaw = searchParams.get("work_preference")
  const workPreferenceList = workPreferenceRaw ? workPreferenceRaw.split(",").map((w) => w.trim()).filter(Boolean) : []
  const date = searchParams.get("date")
  const firstTime = searchParams.get("first_time") === "1"
  const experienceLevel = searchParams.get("experience_level")
  const jobType = searchParams.get("job_type")

  const chips: Chip[] = []
  if (country) chips.push({ key: "country", label: country })
  if (city) chips.push({ key: "city", label: city })
  if (district) chips.push({ key: "district", label: district })
  workPreferenceList.forEach((w) => {
    chips.push({ key: "work_preference", label: WORK_PREFERENCE_LABELS[w] ?? w, value: w })
  })
  if (date) chips.push({ key: "date", label: DATE_LABELS[date] ?? date })
  if (firstTime) chips.push({ key: "first_time", label: "İlk kez yayınlananlar" })
  if (experienceLevel) chips.push({ key: "experience_level", label: EXPERIENCE_LABELS[experienceLevel] ?? experienceLevel })
  if (jobType) chips.push({ key: "job_type", label: JOB_TYPE_LABELS[jobType] ?? jobType })

  const removeFilter = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (key === "work_preference" && value != null) {
      const list = workPreferenceList.filter((w) => w !== value)
      if (list.length) next.set("work_preference", list.join(","))
      else next.delete("work_preference")
    } else {
      next.delete(key)
    }
    router.push(`/is-ilanlari?${next.toString()}`, { scroll: false })
  }

  if (chips.length === 0) return null

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Seçili Filtreler ({chips.length}):</span>
      {chips.map(({ key, label, value }) => (
        <span
          key={key === "work_preference" && value ? `work_preference-${value}` : `${key}-${label}`}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-3 py-1 text-sm"
        >
          {label}
          <button
            type="button"
            onClick={() => removeFilter(key, value)}
            className="rounded-full p-0.5 hover:bg-muted"
            aria-label={`${label} filtresini kaldır`}
          >
            <X className="size-3.5" />
          </button>
        </span>
      ))}
      <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground" onClick={() => router.push("/is-ilanlari")} asChild>
        <Link href="/is-ilanlari">Filtreleri Temizle</Link>
      </Button>
    </div>
  )
}

export { SORT_LABELS }
