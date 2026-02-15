import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Calendar, Globe, Tag, Link2 } from "lucide-react"
import { getNewsById } from "@/lib/news/aggregate"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { SOURCE_BADGE_COLORS } from "@/lib/news/types"
import { cn } from "@/lib/utils"

const REVALIDATE = 900

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const decodedId = decodeURIComponent(id)
  const item = await getNewsById(decodedId)
  if (!item) {
    return buildPageMetadata({
      title: getSiteTitle("Haber bulunamadı"),
      description: "Haber bulunamadı.",
      path: `/news/${id}`,
      noIndex: true,
    })
  }
  const path = `/news/${encodeURIComponent(item.id)}`
  return buildPageMetadata({
    title: getSiteTitle(item.title),
    description: item.description.slice(0, 160),
    path,
    image: item.image ?? undefined,
  })
}

export const revalidate = REVALIDATE

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  if (!value) return null
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  )
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params
  const decodedId = decodeURIComponent(id)
  const item = await getNewsById(decodedId)

  if (!item) notFound()

  const publishedFormatted = new Date(item.publishedAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  const categoryLabel = item.category === "turkish" ? "Türkiye" : "Global"
  const languageLabel = item.language === "tr" ? "Türkçe" : "English"

  const badgeClass = cn(
    "border text-sm font-medium",
    SOURCE_BADGE_COLORS[item.source] ?? "bg-muted text-muted-foreground border-border"
  )

  return (
    <div className="min-h-screen bg-background">
      <article className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
          <Link href="/community#feed">
            <ArrowLeft className="mr-2 size-4" />
            Geri
          </Link>
        </Button>

        {/* Görsel */}
        {item.image && (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
            <img
              src={item.image}
              alt=""
              className="h-full w-full object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
        )}

        {/* Tüm meta veriler */}
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-4">
          <DetailRow label="Kaynak" value={item.source} icon={Tag} />
          <DetailRow label="Kategori" value={categoryLabel} icon={Tag} />
          <DetailRow label="Dil" value={languageLabel} icon={Globe} />
          <DetailRow label="Yayın tarihi" value={publishedFormatted} icon={Calendar} />
          <DetailRow label="ISO tarih" value={item.publishedAt} />
        </div>

        <header className="mt-4">
          <Badge className={badgeClass} variant="outline">
            {item.source}
          </Badge>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {item.title}
          </h1>
        </header>

        {/* Açıklama (erişebildiğimiz tüm veri) */}
        {item.description && (
          <section className="mt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Açıklama
            </h2>
            <p className="mt-1 text-base leading-relaxed text-foreground">
              {item.description}
            </p>
          </section>
        )}

        {/* İçerik (varsa) */}
        {item.content && (
          <section className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              İçerik
            </h2>
            <div className="prose prose-neutral mt-2 dark:prose-invert max-w-none whitespace-pre-line text-foreground">
              {item.content}
            </div>
          </section>
        )}

        {/* Orijinal URL - her zaman göster */}
        <section className="mt-8 rounded-lg border border-border bg-muted/30 p-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Link2 className="size-4" />
            Orijinal kaynak
          </h2>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block break-all text-sm text-primary hover:underline"
          >
            {item.url}
          </a>
          <Button className="mt-3" asChild>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              Orijinal kaynakta oku
              <ExternalLink className="ml-2 size-4" />
            </a>
          </Button>
        </section>

        {/* Teknik: id (isteğe bağlı) */}
        <div className="mt-6 text-xs text-muted-foreground">
          <span className="font-mono">id: {item.id}</span>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/community#feed">Topluluk haberlerine dön</Link>
          </Button>
        </div>
      </article>
    </div>
  )
}
