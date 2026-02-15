"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CommunityHero() {
  return (
    <div className="relative h-[80px] w-full">
      <div className="sticky top-0 z-30 w-full">
        <div className="relative flex h-[80px] w-full items-center overflow-hidden rounded-b-3xl bg-gradient-to-br from-[#0f2d3a] via-[#134050] to-[#0f2d3a] px-4">
          <div
            className="absolute inset-0 opacity-[0.12] text-white"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute -right-1/4 -top-1/4 h-[80%] w-[80%] rounded-full bg-blue-400/12 blur-3xl" aria-hidden />
          <div className="absolute bottom-0 right-0 h-1/2 w-1/2 rounded-full bg-blue-300/8 blur-2xl" aria-hidden />

          <div className="container relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-4 px-4">
            <div className="flex min-w-0 shrink items-center gap-3">
              <span className="shrink-0 rounded-full border border-blue-300/40 bg-blue-400/15 px-3 py-1 text-xs font-medium uppercase tracking-widest text-blue-100 backdrop-blur-sm">
                Topluluk
              </span>
              <h1 className="truncate text-lg font-bold tracking-tight text-white drop-shadow-sm md:text-xl">
                Topluluk haberleri ve etkinlikler
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <p className="hidden max-w-[200px] truncate text-sm text-white/90 drop-shadow-sm sm:block md:max-w-[280px]">
                Haberler, blog yazıları ve kaynaklar. Discord, GitHub ve LinkedIn ile bağlanın, birlikte öğrenin.
              </p>
              <div className="hidden h-4 w-px bg-blue-300/40 sm:block" />
              <span className="hidden text-xs font-medium uppercase tracking-wider text-blue-200/70 sm:inline">CodeCraftX</span>
              <Button asChild size="sm" variant="secondary" className="border-white/30 bg-white/15 text-white hover:bg-white/25">
                <Link href="#feed">Akışı incele</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
