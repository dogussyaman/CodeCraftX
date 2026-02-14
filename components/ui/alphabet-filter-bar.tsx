"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { TERMS_BASE_PATH } from "@/lib/glossary"
import type { TurkishLetter } from "@/lib/glossary"

const barClass =
  "flex min-h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors"
const activeClass = "bg-primary text-primary-foreground"
const inactiveClass = "bg-muted text-muted-foreground hover:bg-muted/80"

interface AlphabetFilterBarProps {
  letters: readonly TurkishLetter[]
  activeLetter: string
  className?: string
}

/**
 * Alfabetik filtre çubuğu. Her harf /terimler/[letter] ile linklenir.
 */
export function AlphabetFilterBar({
  letters,
  activeLetter,
  className,
}: AlphabetFilterBarProps) {
  const normalizedActive = activeLetter.trim().toUpperCase()

  return (
    <nav
      className={cn("flex flex-wrap gap-1", className)}
      aria-label="Alfabetik terim filtresi"
    >
      {letters.map((letter) => {
        const href = `${TERMS_BASE_PATH}/${letter.toLowerCase()}`
        const isActive = letter === normalizedActive

        return (
          <Link
            key={letter}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(barClass, isActive ? activeClass : inactiveClass)}
          >
            {letter}
          </Link>
        )
      })}
    </nav>
  )
}
