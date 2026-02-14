"use client"

import type React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

const PER_PAGE_OPTIONS = [10, 20] as const

export type GlossaryPaginationProps = {
  currentPage: number
  totalPages: number
  totalCount: number
  perPage: number
  baseParams: { q?: string; category?: string }
}

function buildHref(params: { q?: string; category?: string; page?: number; perPage?: number }): string {
  const search = new URLSearchParams()
  if (params.q) search.set("q", params.q)
  if (params.category) search.set("category", params.category)
  if (params.page && params.page > 1) search.set("page", String(params.page))
  if (params.perPage && params.perPage !== 20) search.set("perPage", String(params.perPage))
  const qs = search.toString()
  return qs ? `/terimler?${qs}` : "/terimler"
}

export function GlossaryPagination({
  currentPage,
  totalPages,
  totalCount,
  perPage,
  baseParams,
}: GlossaryPaginationProps) {
  if (totalPages <= 1) return null

  const base = { ...baseParams, perPage }
  const prevHref = currentPage > 1 ? buildHref({ ...base, page: currentPage - 1 }) : undefined
  const nextHref = currentPage < totalPages ? buildHref({ ...base, page: currentPage + 1 }) : undefined

  const start = (currentPage - 1) * perPage + 1
  const end = Math.min(currentPage * perPage, totalCount)

  return (
    <div className="mt-8 space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        {start}-{end} / {totalCount} terim
      </p>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            {prevHref ? (
              <PaginationPrevious href={prevHref} aria-label="Önceki sayfa">
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">Önceki</span>
              </PaginationPrevious>
            ) : (
              <span className="flex h-9 items-center gap-1 rounded-md px-2.5 opacity-50 pointer-events-none">
                Önceki
              </span>
            )}
          </PaginationItem>
          {(() => {
            const items: React.ReactNode[] = []
            const show = (p: number) => {
              items.push(
                <PaginationItem key={p}>
                  <PaginationLink href={buildHref({ ...base, page: p })} isActive={p === currentPage}>
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            }
            if (totalPages <= 7) {
              for (let p = 1; p <= totalPages; p++) show(p)
            } else {
              show(1)
              if (currentPage > 3) items.push(<PaginationItem key="ellipsis-prev"><PaginationEllipsis /></PaginationItem>)
              for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
                if (p !== 1 && p !== totalPages) show(p)
              }
              if (currentPage < totalPages - 2) items.push(<PaginationItem key="ellipsis-next"><PaginationEllipsis /></PaginationItem>)
              if (totalPages > 1) show(totalPages)
            }
            return items
          })()}
          <PaginationItem>
            {nextHref ? (
              <PaginationNext href={nextHref} aria-label="Sonraki sayfa">
                <span className="hidden sm:inline">Sonraki</span>
                <ChevronRight className="size-4" />
              </PaginationNext>
            ) : (
              <span className="flex h-9 items-center gap-1 rounded-md px-2.5 opacity-50 pointer-events-none">
                Sonraki
              </span>
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="flex justify-center gap-2 text-sm text-muted-foreground">
        <span>Sayfa başına:</span>
        {PER_PAGE_OPTIONS.map((n) => (
          <Link
            key={n}
            href={buildHref({ ...baseParams, perPage: n, page: 1 })}
            className={perPage === n ? "font-medium text-foreground" : "hover:text-foreground"}
          >
            {n}
          </Link>
        ))}
      </div>
    </div>
  )
}
