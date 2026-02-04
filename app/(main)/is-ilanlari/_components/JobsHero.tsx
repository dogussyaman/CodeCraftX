"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

export function JobsHero() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(searchParams.get("q") ?? "")
  const [location, setLocation] = useState(searchParams.get("city") ?? searchParams.get("location") ?? "")

  const submitSearch = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString())
    if (q.trim()) next.set("q", q.trim())
    else next.delete("q")
    if (location.trim()) next.set("city", location.trim())
    else next.delete("city")
    next.delete("page")
    router.push(`/is-ilanlari?${next.toString()}`, { scroll: false })
  }, [q, location, router, searchParams])

  const clearLocation = () => {
    setLocation("")
    const next = new URLSearchParams(searchParams.toString())
    next.delete("city")
    next.delete("location")
    router.push(`/is-ilanlari?${next.toString()}`, { scroll: false })
  }

  return (
    <section className="pb-6 md:pb-8 overflow-hidden">
      <div className="relative mx-auto z-10 sm:p-5 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold">İş İlanları</h1>
            <p className="text-base md:text-lg text-muted-foreground text-pretty">
              Hedefinize uygun pozisyonları filtreleyin, tek panelden başvurularınızı takip edin.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submitSearch()
            }}
            className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3"
          >
            <div className="flex flex-1 items-center rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <Search className="size-4 text-muted-foreground shrink-0 mr-2" />
              <input
                type="text"
                placeholder="Pozisyon veya şirket ara"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="min-w-0 flex-1 bg-transparent placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="flex flex-1 items-center rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <input
                type="text"
                placeholder="Konum (örn. İzmir)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="min-w-0 flex-1 bg-transparent placeholder:text-muted-foreground focus:outline-none"
              />
              {location && (
                <button
                  type="button"
                  onClick={clearLocation}
                  className="ml-1 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Konumu temizle"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <Button type="submit" size="lg" className="h-[42px] shrink-0 text-base font-semibold sm:h-auto">
              İş Ara
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center">
            İpucu: Pozisyon adı, teknoloji veya şirket ismiyle arama yapabilirsiniz.
          </p>
        </div>
      </div>
    </section>
  )
}
