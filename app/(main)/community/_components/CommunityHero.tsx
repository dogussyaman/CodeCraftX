"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function CommunityHero() {
  const [isVisible, setIsVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    setIsMounted(true)

    const onScroll = () => {
      const currentY = window.scrollY
      const scrollingDown = currentY > lastScrollY.current

      if (currentY < 48) {
        setIsVisible(true)
      } else if (scrollingDown) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      lastScrollY.current = currentY
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="relative h-[280px] w-full md:h-[320px]">
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className={`sticky top-0 z-30 w-full transition-transform duration-400 ease-out ${
          isMounted && !isVisible ? "-translate-y-[110%]" : "translate-y-0"
        }`}
      >
        <div className="relative min-h-[30vh] w-full overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-[#0f2d3a] via-[#134050] to-[#0f2d3a] pt-16 pb-10 md:min-h-[32vh] md:pt-20 md:pb-14">
          <div
            className="absolute inset-0 opacity-[0.12] text-white"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute -right-1/4 -top-1/4 h-[80%] w-[80%] rounded-full bg-blue-400/12 blur-3xl" aria-hidden />
          <div className="absolute bottom-0 right-0 h-1/2 w-1/2 rounded-full bg-blue-300/8 blur-2xl" aria-hidden />

          <div className="absolute -right-[12%] top-1/2 h-[85%] w-[55%] min-w-[280px] max-w-[420px] -translate-y-1/2 opacity-90 md:-right-[8%] md:w-[48%]" aria-hidden>
            <svg viewBox="0 0 280 220" className="h-full w-full object-contain object-right" fill="none">
              <defs>
                <linearGradient id="community-hero-line-a" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#a5f3fc" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="community-hero-line-b" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.15" />
                </linearGradient>
                <linearGradient id="community-hero-line-c" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <path d="M 20 60 Q 90 20 160 70 T 280 50" fill="none" stroke="url(#community-hero-line-a)" strokeWidth="2" strokeLinecap="round" />
              <path d="M 0 120 Q 80 80 150 130 T 260 110" fill="none" stroke="url(#community-hero-line-b)" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 30 180 Q 120 140 200 190" fill="none" stroke="url(#community-hero-line-c)" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 100 40 L 180 100 M 180 100 L 240 60" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeLinecap="round" />
              <circle cx="20" cy="60" r="5" fill="#e0f2fe" />
              <circle cx="160" cy="70" r="6" fill="#a5f3fc" />
              <circle cx="280" cy="50" r="4" fill="#67e8f9" />
              <circle cx="150" cy="130" r="5" fill="#e0f2fe" />
              <circle cx="260" cy="110" r="4" fill="#a5f3fc" />
              <circle cx="200" cy="190" r="5" fill="#67e8f9" />
              <circle cx="100" cy="40" r="4" fill="rgba(255,255,255,0.6)" />
              <circle cx="240" cy="60" r="3" fill="rgba(255,255,255,0.5)" />
            </svg>
          </div>

          <div className="absolute -left-6 top-4 h-32 w-32 text-white/20 md:-left-4 md:h-40 md:w-40" aria-hidden>
            <svg viewBox="0 0 80 80" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M 60 10 L 30 40 L 60 70" />
              <path d="M 20 10 L 50 40 L 20 70" />
            </svg>
          </div>
          <div className="absolute -left-2 bottom-6 h-24 w-24 text-white/15 md:h-28 md:w-28" aria-hidden>
            <svg viewBox="0 0 60 60" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M 15 15 L 45 30 L 15 45" />
            </svg>
          </div>
          <div className="absolute right-[28%] top-2 h-20 w-20 text-white/25 md:right-[24%] md:h-24 md:w-24" aria-hidden>
            <svg viewBox="0 0 60 60" className="h-full w-full" fill="currentColor">
              <circle cx="50" cy="15" r="8" />
              <circle cx="10" cy="45" r="5" opacity="0.7" />
              <path d="M 50 15 Q 30 30 10 45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>

          <div className="container relative z-10 mx-auto max-w-6xl px-4">
            <header className="max-w-2xl">
              <span className="inline-block rounded-full border border-blue-300/40 bg-blue-400/15 px-3 py-1 text-xs font-medium uppercase tracking-widest text-blue-100 backdrop-blur-sm">
                Topluluk
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white drop-shadow-sm md:text-4xl lg:text-[2.65rem]">
                Topluluk haberleri ve etkinlikler
              </h1>
              <p className="mt-3 text-base leading-relaxed text-white/90 drop-shadow-sm md:text-lg">
                Haberler, blog yazıları ve kaynaklar. Discord, GitHub ve LinkedIn ile bağlanın, birlikte öğrenin.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-0.5 w-16 rounded-full bg-blue-300/50" />
                <span className="text-xs font-medium uppercase tracking-wider text-blue-200/70">CodeCraftX</span>
              </div>
              <div className="mt-5">
                <Button asChild size="sm" variant="secondary" className="border-white/30 bg-white/15 text-white hover:bg-white/25">
                  <Link href="#feed">Akışı incele</Link>
                </Button>
              </div>
            </header>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
