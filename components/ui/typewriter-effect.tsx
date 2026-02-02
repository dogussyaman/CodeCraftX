"use client"

import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"

interface TypewriterEffectProps {
  words: string[]
  className?: string
  cursorClassName?: string
  typingSpeed?: number
  deletingSpeed?: number
  delayBetweenWords?: number
}

export function TypewriterEffect({
  words,
  className,
  cursorClassName,
  typingSpeed = 80,
  deletingSpeed = 50,
  delayBetweenWords = 2000,
}: TypewriterEffectProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const longestWord = useMemo(
    () => words.reduce((a, b) => (a.length >= b.length ? a : b), ""),
    [words]
  )

  useEffect(() => {
    const targetWord = words[currentWordIndex]

    if (!isDeleting) {
      if (currentText.length < targetWord.length) {
        const timeout = setTimeout(() => {
          setCurrentText(targetWord.slice(0, currentText.length + 1))
        }, typingSpeed)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => {
          setIsDeleting(true)
        }, delayBetweenWords)
        return () => clearTimeout(timeout)
      }
    } else {
      if (currentText.length > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1))
        }, deletingSpeed)
        return () => clearTimeout(timeout)
      } else {
        setIsDeleting(false)
        setCurrentWordIndex((prev) => (prev + 1) % words.length)
      }
    }
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, delayBetweenWords])

  return (
    <span className={cn("relative inline-block align-middle", className)}>
      {/* Placeholder: reserves space so layout doesn't shift */}
      <span className="invisible whitespace-nowrap" aria-hidden>
        {longestWord}
      </span>
      {/* Typewriter text overlay – same area, no layout shift */}
      <span className="absolute left-0 top-0 inline whitespace-nowrap">
        {currentText}
        <span
          className={cn("animate-pulse border-r-2 border-primary ml-0.5", cursorClassName)}
          aria-hidden
        />
      </span>
    </span>
  )
}
