"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
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

export function JobsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const experience = searchParams.get("experience_level") ?? ""
  const jobType = searchParams.get("job_type") ?? ""

  const setFilter = (key: "experience_level" | "job_type", value: string) => {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    router.push(`/is-ilanlari?${next.toString()}`, { scroll: false })
  }

  return (
    <section className="pb-10">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Deneyim</p>
            <div className="flex flex-wrap gap-2">
              {EXPERIENCE_FILTERS.map((f) => (
                <Button
                  key={f.value || "all-exp"}
                  variant={experience === f.value ? "default" : "outline"}
                  size="sm"
                  className={cn("rounded-lg", experience === f.value && "border-primary")}
                  onClick={() => setFilter("experience_level", f.value)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Çalışma Şekli</p>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPE_FILTERS.map((f) => (
                <Button
                  key={f.value || "all-type"}
                  variant={jobType === f.value ? "default" : "outline"}
                  size="sm"
                  className={cn("rounded-lg", jobType === f.value && "border-primary")}
                  onClick={() => setFilter("job_type", f.value)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
