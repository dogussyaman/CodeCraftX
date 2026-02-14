"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { GLOSSARY_CATEGORIES } from "@/lib/glossary"
import { cn } from "@/lib/utils"

export function GlossaryCategoryTabs() {
  const searchParams = useSearchParams()
  const q = searchParams.get("q") ?? ""
  const category = searchParams.get("category") ?? ""

  const isValidCategory = (c: string) => GLOSSARY_CATEGORIES.some((cat) => cat.id === c)

  const currentCategory = isValidCategory(category) ? category : null

  return (
    <nav className="sticky top-24 space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Kategoriler
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Link
          href={q ? `/terimler?q=${encodeURIComponent(q)}` : "/terimler"}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium transition-colors text-center",
            !currentCategory
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          Tümü
        </Link>
        {GLOSSARY_CATEGORIES.map((cat) => {
          const href = q
            ? `/terimler?q=${encodeURIComponent(q)}&category=${cat.id}`
            : `/terimler?category=${cat.id}`
          return (
            <Link
              key={cat.id}
              href={href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors text-center line-clamp-1",
                currentCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              title={cat.label}
            >
              {cat.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
