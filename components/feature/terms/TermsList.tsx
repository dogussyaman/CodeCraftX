import { Card, CardContent } from "@/components/ui/card"
import type { GlossaryTerm } from "@/lib/glossary"
import { TermItem } from "./TermItem"

interface TermsListProps {
  terms: GlossaryTerm[]
  emptyMessage: string
  headingId?: string
}

/**
 * Terim listesi. Boşsa mesaj gösterir.
 */
export function TermsList({
  terms,
  emptyMessage,
  headingId = "terms-heading",
}: TermsListProps) {
  if (terms.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    )
  }

  return (
    <ul className="space-y-4" aria-labelledby={headingId}>
      {terms.map((t) => (
        <li key={t.term}>
          <TermItem term={t} />
        </li>
      ))}
    </ul>
  )
}
