import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { GlossaryTerm } from "@/lib/glossary"
import { getUsageContent, GLOSSARY_CATEGORIES } from "@/lib/glossary"

interface TermItemProps {
  term: GlossaryTerm
}

/**
 * Tek terim kartı. Schema.org DefinedTerm ile uyumlu semantik yapı.
 */
export function TermItem({ term }: TermItemProps) {
  const usageContent = getUsageContent(term)
  const categoryLabel =
    term.category &&
    (GLOSSARY_CATEGORIES.find((c) => c.id === term.category)?.label ?? term.category)

  return (
    <article itemScope itemType="https://schema.org/DefinedTerm" itemProp="hasDefinedTerm">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-lg flex items-center gap-2" itemProp="name">
              {term.term}
              {term.link && (
                <a
                  href={term.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Kaynak"
                >
                  <ExternalLink className="size-4" />
                </a>
              )}
            </CardTitle>
            {categoryLabel && (
              <span className="text-xs rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                {categoryLabel}
              </span>
            )}
          </div>
          <CardDescription className="text-base text-foreground/90" itemProp="description">
            {term.description}
          </CardDescription>
          {term.detailed_description && (
            <p className="text-sm text-muted-foreground mt-2">
              {term.detailed_description}
            </p>
          )}
          {usageContent && (
            <div className="mt-3 pt-3 border-t prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{usageContent}</ReactMarkdown>
            </div>
          )}
        </CardHeader>
      </Card>
    </article>
  )
}
