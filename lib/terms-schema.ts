import type { GlossaryTerm } from "@/lib/glossary"

/**
 * Terimler sayfası için Schema.org DefinedTermSet / DefinedTerm JSON-LD üretir.
 */
export function buildGlossarySchema(
  terms: GlossaryTerm[],
  letter: string
): object {
  const termList = terms.map((t) => ({
    "@type": "DefinedTerm",
    name: t.term,
    description: t.description,
  }))

  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: `Yazılım Terimleri - ${letter}`,
    hasDefinedTerm: termList,
  }
}
