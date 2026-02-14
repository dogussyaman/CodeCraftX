"use client"

import { useSearchParams } from "next/navigation"
import { ChevronDown } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { JobsFilters } from "./JobsFilters"
import { useState } from "react"
import { cn } from "@/lib/utils"

const FILTER_KEYS = [
  "country",
  "city",
  "district",
  "work_preference",
  "date",
  "first_time",
  "experience_level",
  "job_type",
] as const

function countActiveFilters(searchParams: URLSearchParams): number {
  let n = 0
  for (const key of FILTER_KEYS) {
    const v = searchParams.get(key)
    if (key === "work_preference" && v) {
      n += v.split(",").filter(Boolean).length
    } else if (v) {
      n += 1
    }
  }
  return n
}

export function JobsFiltersSection() {
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const count = countActiveFilters(searchParams)

  return (
    <>
      {/* Mobil: açılır/kapanır filtre alanı */}
      <div className="order-2 w-full shrink-0 lg:hidden">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between rounded-lg border border-border bg-card px-4 py-3 font-medium"
              aria-expanded={open}
            >
              <span>
                Filtreler
                {count > 0 && (
                  <span className="ml-2 text-muted-foreground">({count})</span>
                )}
              </span>
              <ChevronDown
                className={cn("size-4 transition-transform", open && "rotate-180")}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3">
              <JobsFilters />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Masaüstü: her zaman görünen aside */}
      <aside className="order-2 hidden w-[280px] shrink-0 lg:order-1 lg:block">
        <JobsFilters />
      </aside>
    </>
  )
}
