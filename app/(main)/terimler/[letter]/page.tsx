import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BookOpen } from "lucide-react"
import {
  TURKISH_ALPHABET,
  isValidLetter,
  normalizeLetter,
  getTermsByLetter,
  EMPTY_TERMS_MESSAGE,
  TERMS_BASE_PATH,
} from "@/lib/glossary"
import { buildGlossarySchema } from "@/lib/terms-schema"
import { AlphabetFilterBar } from "@/components/ui/alphabet-filter-bar"
import { TermsList } from "@/components/feature/terms"

interface PageProps {
  params: Promise<{ letter: string }>
}

const PAGE_TITLE_BASE = "Yazılım Terimleri"
const SITE_NAME = "CodeCraftX"

export function generateStaticParams() {
  return TURKISH_ALPHABET.map((letter) => ({
    letter: letter.toLowerCase(),
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { letter } = await params
  if (!isValidLetter(letter)) return { title: SITE_NAME }
  const activeLetter = normalizeLetter(letter)!
  const title = `${PAGE_TITLE_BASE} - ${activeLetter} | ${SITE_NAME}`
  const description = `${activeLetter} harfi ile başlayan yazılım terimleri. Geliştiriciler için sık kullanılan terimler ve açıklamaları.`
  const path = `${TERMS_BASE_PATH}/${activeLetter.toLowerCase()}`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ""
  const canonical = baseUrl ? `${baseUrl}${path}` : undefined

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function TerimlerLetterPage({ params }: PageProps) {
  const { letter } = await params

  if (!isValidLetter(letter)) {
    notFound()
  }

  const activeLetter = normalizeLetter(letter)!
  const terms = getTermsByLetter(activeLetter)
  const schema = buildGlossarySchema(terms, activeLetter)

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-2">
            <BookOpen className="size-10" />
            {PAGE_TITLE_BASE}
          </h1>
          <p className="text-muted-foreground">
            {activeLetter} harfi ile başlayan terimler
          </p>
        </header>

        <AlphabetFilterBar
          letters={TURKISH_ALPHABET}
          activeLetter={activeLetter}
          className="mb-8"
        />

        <section className="mt-8" aria-labelledby="terms-heading">
          <h2 id="terms-heading" className="text-xl font-semibold mb-4 sr-only">
            Seçilen harfe göre terimler
          </h2>
          <TermsList
            terms={terms}
            emptyMessage={EMPTY_TERMS_MESSAGE}
            headingId="terms-heading"
          />
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </div>
    </div>
  )
}
