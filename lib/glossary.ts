/**
 * Yazılım terimleri sözlüğü - data/terimler.json'dan beslenir.
 * İleride DB veya topluluk katkısı eklenebilir.
 */
import terimlerData from "@/data/terimler.json"

export interface GlossaryTerm {
  term: string
  category: string
  description: string
  detailed_description: string
  example_usage: string
  example_code: string
  level: "beginner" | "intermediate" | "advanced"
  usage_markdown?: string
  link?: string
}

const TERMS = terimlerData as GlossaryTerm[]

/** Türkçe alfabe (alfabetik filtre barı ve URL validasyonu için) */
export const TURKISH_ALPHABET = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "İ", "J", "K", "L", "M",
  "N", "O", "Ö", "P", "R", "S", "Ş", "T", "U", "Ü", "V", "Y", "Z",
] as const

export type TurkishLetter = (typeof TURKISH_ALPHABET)[number]

const ALLOWED_LETTERS_SET = new Set<string>(TURKISH_ALPHABET)

export const TERMS_BASE_PATH = "/terimler"
export const EMPTY_TERMS_MESSAGE = "Bu harfle başlayan terim bulunamadı"

/** URL'den gelen harf parametresinin geçerli olup olmadığını kontrol eder */
export function isValidLetter(value: unknown): value is TurkishLetter {
  if (typeof value !== "string") return false
  const normalized = value.trim().toUpperCase()
  if (normalized.length !== 1) return false
  return ALLOWED_LETTERS_SET.has(normalized)
}

/** Harfi normalize eder (büyük harf); geçersizse null */
export function normalizeLetter(value: unknown): TurkishLetter | null {
  if (!isValidLetter(value)) return null
  return value.trim().toUpperCase() as TurkishLetter
}

/** Terimin ilk harfini Türkçe uyumlu büyük harf olarak döner */
function firstLetter(t: GlossaryTerm): string {
  return t.term.trim().charAt(0).toLocaleUpperCase("tr-TR")
}

/** Belirtilen harfle başlayan terimleri döner (Türkçe İ/I uyumlu) */
export function getTermsByLetter(letter: string): GlossaryTerm[] {
  const upper = letter.trim().toUpperCase()
  return GLOSSARY_TERMS.filter((t) => firstLetter(t) === upper).sort((a, b) =>
    a.term.localeCompare(b.term, "tr")
  )
}

// Dinamik kategoriler: JSON'daki unique category değerleri (Türkçe)
const categorySet = new Set(TERMS.map((t) => t.category))
export const GLOSSARY_CATEGORIES: { id: string; label: string }[] = Array.from(categorySet)
  .sort((a, b) => a.localeCompare(b, "tr"))
  .map((id) => ({ id, label: id }))

export const GLOSSARY_TERMS: GlossaryTerm[] = TERMS

export function getGlossaryByLetter(): Record<string, GlossaryTerm[]> {
  const byLetter: Record<string, GlossaryTerm[]> = {}
  for (const t of GLOSSARY_TERMS) {
    const letter = firstLetter(t)
    if (!byLetter[letter]) byLetter[letter] = []
    byLetter[letter].push(t)
  }
  for (const key of Object.keys(byLetter)) {
    byLetter[key].sort((a, b) => a.term.localeCompare(b.term, "tr"))
  }
  return byLetter
}

export function getGlossaryByCategory(): Record<string, GlossaryTerm[]> {
  const byCategory: Record<string, GlossaryTerm[]> = {}
  for (const t of GLOSSARY_TERMS) {
    const cat = t.category
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(t)
  }
  for (const key of Object.keys(byCategory)) {
    byCategory[key].sort((a, b) => a.term.localeCompare(b.term, "tr"))
  }
  return byCategory
}

export function searchGlossary(q: string): GlossaryTerm[] {
  const lower = q.toLowerCase().trim()
  if (!lower) return GLOSSARY_TERMS
  return GLOSSARY_TERMS.filter(
    (t) =>
      t.term.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower) ||
      (t.detailed_description && t.detailed_description.toLowerCase().includes(lower))
  )
}

/** Kullanım bölümü için markdown veya fallback (example_usage + example_code) */
export function getUsageContent(t: GlossaryTerm): string {
  if (t.usage_markdown && t.usage_markdown.trim()) return t.usage_markdown
  const usage = t.example_usage?.trim()
  const code = t.example_code?.trim()
  if (!usage && !code) return ""
  if (usage && code) return `**Örnek:** ${usage}\n\n\`\`\`\n${code}\n\`\`\``
  if (usage) return `**Örnek:** ${usage}`
  return `\`\`\`\n${code}\n\`\`\``
}
