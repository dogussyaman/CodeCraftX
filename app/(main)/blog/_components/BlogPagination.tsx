"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface BlogPaginationProps {
  totalPages: number
  currentPage: number
  basePath?: string
  searchQuery?: string
}

export function BlogPagination({
  totalPages,
  currentPage,
  basePath = "/blog",
  searchQuery,
}: BlogPaginationProps) {
  const searchParams = useSearchParams()
  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(page))
    if (searchQuery?.trim()) params.set("q", searchQuery.trim())
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  if (totalPages <= 1) return null

  const prevPage = currentPage > 1 ? currentPage - 1 : null
  const nextPage = currentPage < totalPages ? currentPage + 1 : null

  return (
    <nav
      className="flex items-center justify-center gap-2 pt-8 pb-4"
      aria-label="Yazı listesi sayfalandırma"
    >
      {prevPage ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={buildUrl(prevPage)} className="gap-1">
            <ChevronLeft className="size-4" />
            Önceki
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled className="gap-1">
          <ChevronLeft className="size-4" />
          Önceki
        </Button>
      )}
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
          p === currentPage ? (
            <Button key={p} variant="default" size="sm" className="min-w-9" asChild>
              <Link href={buildUrl(p)} aria-current="page">
                {p}
              </Link>
            </Button>
          ) : (
            <Button key={p} variant="ghost" size="sm" className="min-w-9" asChild>
              <Link href={buildUrl(p)}>{p}</Link>
            </Button>
          )
        )}
      </div>
      {nextPage ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={buildUrl(nextPage)} className="gap-1">
            Sonraki
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled className="gap-1">
          Sonraki
          <ChevronRight className="size-4" />
        </Button>
      )}
    </nav>
  )
}
