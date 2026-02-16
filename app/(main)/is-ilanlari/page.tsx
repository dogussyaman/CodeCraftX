import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { createServerClient } from "@/lib/supabase/server"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { JobsHero } from "./_components/JobsHero"
import { JobsFiltersSection } from "./_components/JobsFiltersSection"
import { JobsActiveFilters } from "./_components/JobsActiveFilters"
import { JobsList } from "./_components/JobsList"
import { JobsCta } from "./_components/JobsCta"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("İş İlanları"),
  description: "Yazılım ve teknoloji iş ilanları. CodeCraftX ile doğru iş fırsatını bulun.",
  path: "/is-ilanlari",
})

type PageProps = {
  searchParams: Promise<{
    q?: string
    city?: string
    country?: string
    district?: string
    work_preference?: string
    date?: string
    first_time?: string
    experience_level?: string
    job_type?: string
    sort?: string
  }>
}

function getDateFilter(date: string | undefined): { from: Date } | null {
  if (!date) return null
  const now = new Date()
  switch (date) {
    case "today": {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      return { from: start }
    }
    case "3h":
      return { from: new Date(now.getTime() - 3 * 60 * 60 * 1000) }
    case "8h":
      return { from: new Date(now.getTime() - 8 * 60 * 60 * 1000) }
    case "3d":
      return { from: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) }
    case "7d":
      return { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    case "15d":
      return { from: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) }
    default:
      return null
  }
}

export default async function IsIlanlariPage({ searchParams }: PageProps) {
  const supabase = await createServerClient()
  const params = await searchParams

  const q = (params.q ?? "").trim().toLowerCase()
  const city = params.city?.trim()
  const country = params.country?.trim()
  const district = params.district?.trim()
  const workPreferenceParam = params.work_preference ?? ""
  const workPreferenceList = workPreferenceParam ? workPreferenceParam.split(",").filter(Boolean) : []
  const dateFilter = getDateFilter(params.date)
  const firstTime = params.first_time === "1"
  const experienceLevel = params.experience_level
  const jobType = params.job_type
  const sort = params.sort ?? "date-desc"

  let query = supabase
    .from("job_postings")
    .select(
      `
      *,
      companies (
        name,
        logo_url
      ),
      job_skills (
        skills (
          name
        )
      )
    `,
    )
    .in("status", ["active", "published"])
    .or("visibility.eq.public,visibility.is.null")
    .limit(100)

  if (experienceLevel) query = query.eq("experience_level", experienceLevel)
  if (jobType) query = query.eq("job_type", jobType)
  if (country) query = query.eq("country", country)
  if (city) query = query.eq("city", city)
  if (district) query = query.eq("district", district)

  if (dateFilter) {
    query = query.gte("created_at", dateFilter.from.toISOString())
  }

  if (sort === "date-asc") {
    query = query.order("created_at", { ascending: true })
  } else {
    query = query.order("created_at", { ascending: false })
  }

  const { data: rawIlanlar } = await query

  let ilanlar = rawIlanlar ?? []

  if (q) {
    ilanlar = ilanlar.filter((ilan: any) => {
      const title = (ilan.title ?? "").toLowerCase()
      const companyName = (ilan.companies?.name ?? "").toLowerCase()
      return title.includes(q) || companyName.includes(q)
    })
  }

  if (workPreferenceList.length > 0) {
    ilanlar = ilanlar.filter((ilan: any) => {
      const single = ilan.work_preference
      const list = Array.isArray(ilan.work_preference_list) ? ilan.work_preference_list : []
      return workPreferenceList.some(
        (w: string) => single === w || list.includes(w),
      )
    })
  }

  if (firstTime) {
    const ONE_MINUTE_MS = 60 * 1000
    ilanlar = ilanlar.filter((ilan: any) => {
      const created = new Date(ilan.created_at ?? 0).getTime()
      const updated = new Date(ilan.updated_at ?? ilan.created_at ?? 0).getTime()
      return Math.abs(created - updated) < ONE_MINUTE_MS
    })
  }

  const count = ilanlar.length
  const pageTitle = city
    ? `${count} ${city} İş İlanları`
    : country
      ? `${count} İş İlanları`
      : `${count} İş İlanları`

  return (
    <div className="min-h-screen bg-background pt-12">
      <div className="container mx-auto px-3 pt-6 pb-4 sm:px-4 md:pt-8 md:pb-5">
        <Breadcrumb className="mb-3 sm:mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Ana Sayfa</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/is-ilanlari">İş İlanları</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {city && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{city} İş İlanları</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6 xl:gap-8">
          <Suspense fallback={<div className="h-64 shrink-0 lg:w-[280px] rounded-lg border bg-muted/30 animate-pulse" />}>
            <JobsFiltersSection />
          </Suspense>
          <div className="order-1 min-w-0 flex-1 lg:order-2">
            <JobsHero />
            <Suspense fallback={null}>
              <JobsActiveFilters />
            </Suspense>
            <JobsList
              ilanlar={ilanlar}
              count={count}
              pageTitle={pageTitle}
              sort={sort}
            />
          </div>
        </div>
      </div>
      <JobsCta />
    </div>
  )
}
