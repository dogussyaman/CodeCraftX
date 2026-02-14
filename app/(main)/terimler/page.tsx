import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ExternalLink } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  searchGlossary,
  getUsageContent,
  GLOSSARY_CATEGORIES,
  TERMS_BASE_PATH,
  TURKISH_ALPHABET,
} from "@/lib/glossary"
import { GlossarySearch } from "./_components/GlossarySearch"
import { GlossaryPagination } from "./_components/GlossaryPagination"
import { AlphabetFilterBar } from "@/components/ui/alphabet-filter-bar"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Terimler"),
  description: "Yazılım ve teknoloji terimleri sözlüğü. CodeCraftX terimler rehberi.",
  path: "/terimler",
})

const DEFAULT_PER_PAGE = 20
const DEFAULT_LETTER = "a"

export default async function TerimlerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; perPage?: string }>
}) {
  const { q, page: pageParam, perPage: perPageParam } = await searchParams

  if (!q?.trim()) {
    redirect(`${TERMS_BASE_PATH}/${DEFAULT_LETTER}`)
  }

  const searchResults = searchGlossary(q)
  const byLetter = getGlossaryByLetter()
  const perPage =
    perPageParam === "10" ? 10 : perPageParam === "20" ? 20 : DEFAULT_PER_PAGE
  const totalCount = searchResults.length
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage))
  const page = Math.max(
    1,
    Math.min(totalPages, parseInt(pageParam ?? "1", 10) || 1)
  )
  const start = (page - 1) * perPage
  const paginatedTerms = searchResults.slice(start, start + perPage)
  const baseParams = { q: q ?? undefined }

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <BookOpen className="size-10" />
            Yazılım Terimleri
          </h1>
          <p className="text-muted-foreground">
            Geliştiriciler için sık kullanılan terimler ve kısa açıklamaları.
          </p>
        </header>

        <GlossarySearch />

        <AlphabetFilterBar
          letters={TURKISH_ALPHABET}
          activeLetter=""
          className="mb-8"
        />

        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            &quot;{q}&quot; araması ({totalCount} sonuç)
          </h2>
          {paginatedTerms.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Arama sonucu bulunamadı.
              </CardContent>
            </Card>
          ) : (
            <>
              <ul className="space-y-4">
                {paginatedTerms.map((t) => (
                  <li key={t.term}>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {t.term}
                            {t.link && (
                              <a
                                href={t.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground"
                                aria-label="Kaynak"
                              >
                                <ExternalLink className="size-4" />
                              </a>
                            )}
                          </CardTitle>
                          {t.category && (
                            <span className="text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                              {GLOSSARY_CATEGORIES.find((c) => c.id === t.category)?.label ?? t.category}
                            </span>
                          )}
                        </div>
                        <CardDescription className="text-base text-foreground/90">
                          {t.description}
                        </CardDescription>
                        {t.detailed_description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {t.detailed_description}
                          </p>
                        )}
                        {getUsageContent(t) && (
                          <div className="mt-3 pt-3 border-t prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {getUsageContent(t)}
                            </ReactMarkdown>
                          </div>
                        )}
                      </CardHeader>
                    </Card>
                  </li>
                ))}
              </ul>
              <GlossaryPagination
                currentPage={page}
                totalPages={totalPages}
                totalCount={totalCount}
                perPage={perPage}
                baseParams={baseParams}
              />
            </>
          )}
        </section>
      </div>
    </div>
  )
}
