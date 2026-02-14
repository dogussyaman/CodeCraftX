"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ProvinceDistrictSelect } from "@/components/location/ProvinceDistrictSelect"
import { DEFAULT_COUNTRY } from "@/lib/provinces-types"
import { cn } from "@/lib/utils"

const EXPERIENCE_FILTERS = [
  { value: "", label: "Tümü" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
]

const JOB_TYPE_FILTERS = [
  { value: "", label: "Tümü" },
  { value: "full-time", label: "Tam Zamanlı" },
  { value: "part-time", label: "Yarı Zamanlı" },
  { value: "contract", label: "Sözleşmeli" },
  { value: "internship", label: "Staj" },
  { value: "freelance", label: "Freelance" },
]

const WORK_PREFERENCE_OPTIONS = [
  { value: "on-site", label: "İş Yerinde" },
  { value: "remote", label: "Uzaktan / Remote" },
  { value: "hybrid", label: "Hibrit" },
]

const DATE_OPTIONS = [
  { value: "", label: "Tümü" },
  { value: "today", label: "Bugünün ilanları" },
  { value: "3h", label: "Son 3 saat" },
  { value: "8h", label: "Son 8 saat" },
  { value: "3d", label: "Son 3 gün" },
  { value: "7d", label: "Son 7 gün" },
  { value: "15d", label: "Son 15 gün" },
]

export function JobsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [localCountry, setLocalCountry] = useState(searchParams.get("country") ?? DEFAULT_COUNTRY)
  const [localCity, setLocalCity] = useState(searchParams.get("city") ?? "")
  const [localDistrict, setLocalDistrict] = useState(searchParams.get("district") ?? "")

  const cityParam = searchParams.get("city") ?? ""
  const districtParam = searchParams.get("district") ?? ""
  useEffect(() => {
    setLocalCountry(searchParams.get("country") ?? DEFAULT_COUNTRY)
    setLocalCity(cityParam)
    setLocalDistrict(districtParam)
  }, [cityParam, districtParam])

  const workPreferenceRaw = searchParams.get("work_preference") ?? ""
  const workPreferenceList = workPreferenceRaw ? workPreferenceRaw.split(",").map((w) => w.trim()).filter(Boolean) : []
  const date = searchParams.get("date") ?? ""
  const firstTime = searchParams.get("first_time") === "1"
  const experience = searchParams.get("experience_level") ?? ""
  const jobType = searchParams.get("job_type") ?? ""

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString())
    if (value && value.trim()) next.set(key, value.trim())
    else next.delete(key)
    router.push(`/is-ilanlari?${next.toString()}`, { scroll: false })
  }

  const applyLocation = () => {
    if (localCity || localDistrict) {
      setParam("country", localCountry || DEFAULT_COUNTRY)
    } else {
      setParam("country", null)
    }
    setParam("city", localCity || null)
    setParam("district", localDistrict || null)
  }

  const setWorkPreference = (value: string, checked: boolean) => {
    const nextList = checked
      ? [...workPreferenceList.filter((w) => w !== value), value]
      : workPreferenceList.filter((w) => w !== value)
    const next = new URLSearchParams(searchParams.toString())
    if (nextList.length) next.set("work_preference", nextList.join(","))
    else next.delete("work_preference")
    router.push(`/is-ilanlari?${next.toString()}`, { scroll: false })
  }

  const setFirstTime = (checked: boolean) => {
    const next = new URLSearchParams(searchParams.toString())
    if (checked) next.set("first_time", "1")
    else next.delete("first_time")
    router.push(`/is-ilanlari?${next.toString()}`, { scroll: false })
  }

  return (
    <aside className="w-full shrink-0 space-y-4 md:w-[280px] md:space-y-6">
      <div className="space-y-3 rounded-lg border border-border bg-card p-3 sm:p-4">
        <h3 className="text-sm font-semibold">İl / İlçe</h3>
        <ProvinceDistrictSelect
          city={localCity}
          district={localDistrict}
          onChange={({ country, city, district }) => {
            setLocalCountry(country)
            setLocalCity(city)
            setLocalDistrict(district)
          }}
          districtOptional
          compact
        />
        <Button type="button" variant="secondary" size="sm" className="w-full" onClick={applyLocation}>
          Konumu Uygula
        </Button>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-card p-3 sm:p-4">
        <h3 className="text-sm font-semibold">Çalışma Tercihi</h3>
        <div className="space-y-2">
          {WORK_PREFERENCE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={workPreferenceList.includes(opt.value)}
                onCheckedChange={(c) => setWorkPreference(opt.value, !!c)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-card p-3 sm:p-4">
        <h3 className="text-sm font-semibold">Tarih</h3>
        <RadioGroup
          value={date || "all"}
          onValueChange={(v) => setParam("date", v === "all" ? "" : v)}
          className="space-y-2"
        >
          {DATE_OPTIONS.map((opt) => (
            <label
              key={opt.value || "all"}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <RadioGroupItem value={opt.value || "all"} id={`date-${opt.value || "all"}`} />
              {opt.label}
            </label>
          ))}
        </RadioGroup>
        <label className="flex cursor-pointer items-center gap-2 pt-2 text-sm">
          <Checkbox checked={firstTime} onCheckedChange={(c) => setFirstTime(!!c)} />
          İlk kez yayınlananlar
        </label>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-card p-3 sm:p-4">
        <h3 className="text-sm font-semibold">Deneyim</h3>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_FILTERS.map((f) => (
            <Button
              key={f.value || "all-exp"}
              variant={experience === f.value ? "default" : "outline"}
              size="sm"
              className={cn("rounded-lg", experience === f.value && "border-primary")}
              onClick={() => setParam("experience_level", f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-card p-3 sm:p-4">
        <h3 className="text-sm font-semibold">Çalışma Şekli</h3>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPE_FILTERS.map((f) => (
            <Button
              key={f.value || "all-type"}
              variant={jobType === f.value ? "default" : "outline"}
              size="sm"
              className={cn("rounded-lg", jobType === f.value && "border-primary")}
              onClick={() => setParam("job_type", f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>
    </aside>
  )
}
