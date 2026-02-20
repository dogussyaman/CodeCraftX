"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { motion } from "motion/react"
import { ArrowRight, Circle, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Ana sayfa HeroSection ile aynı resim yapısı. Sıra: 3 (arkada), 2 (ortada), 1 (önde). Yeni işveren resimlerini ekleyince light/dark path'leri burada güncelle. */
const STACK_SOURCES = [
  { light: "/ss3lgth.png", dark: "/ss3drkpng.png" },
  { light: "/ss2lgth.png", dark: "/ss2drk.png" },
  { light: "/ss1lgth.png", dark: "/ss1drk.png" },
] as const
const HERO_HINT = "AI destekli CV analizi, akıllı eşleşme ve şeffaf işe alım süreci — tek platformda."
const HERO_STACK = [
  {
    id: 0,
    z: "z-10",
    rest: { x: "-18%", y: 20, rotate: -9, scale: 1, opacity: 0.94 },
    open: { x: "-26%", y: 12, rotate: -10, scale: 1, opacity: 0.98 },
  },
  {
    id: 1,
    z: "z-20",
    rest: { x: "0%", y: 34, rotate: -8, scale: 1, opacity: 1 },
    open: { x: "0%", y: 26, rotate: -8, scale: 1, opacity: 1 },
  },
  {
    id: 2,
    z: "z-30",
    rest: { x: "18%", y: 12, rotate: -9, scale: 1, opacity: 0.94 },
    open: { x: "26%", y: 4, rotate: -8, scale: 1, opacity: 0.98 },
  },
] as const
const FLOATING_BADGES = [
  { text: "CV İncele", pos: "left-2 top-3", delay: 0, dur: 5.5 },
  { text: "AI Analiz", pos: "left-24 top-14", delay: 0.2, dur: 6.2 },
  { text: "Skill Match", pos: "left-10 top-28", delay: 0.35, dur: 5.8 },
  { text: "Aday Skoru", pos: "left-40 top-8", delay: 0.5, dur: 6.5 },
  { text: "HR Pipeline", pos: "left-44 top-24", delay: 0.65, dur: 5.4 },
  { text: "İlan Analizi", pos: "left-28 top-40", delay: 0.8, dur: 6.1 },
] as const

export function IsverenHeroSection() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedTheme === "dark"

  return (
    <section className="relative overflow-hidden pb-16 pt-24 md:pb-24 md:pt-32">
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="pointer-events-none absolute right-0 top-8 hidden h-64 w-80 xl:block">
            {FLOATING_BADGES.map((item, idx) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0.5, y: 0, x: 0 }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                  y: [0, -3, -7, -3, 0],
                  x: [0, idx % 2 === 0 ? 2 : -2, idx % 2 === 0 ? 4 : -4, idx % 2 === 0 ? 2 : -2, 0],
                }}
                transition={{
                  opacity: { duration: item.dur, delay: item.delay, repeat: Infinity, ease: "easeInOut", repeatType: "loop" },
                  y: { duration: item.dur, delay: item.delay, repeat: Infinity, ease: "easeInOut", repeatType: "loop" },
                  x: { duration: item.dur, delay: item.delay, repeat: Infinity, ease: "easeInOut", repeatType: "loop" },
                }}
                style={{ willChange: "transform", transform: "translateZ(0)" }}
                className={`absolute ${item.pos} rounded-full border border-accent-500/30 bg-white/80 px-3 py-1.5 text-xs font-medium tracking-wide text-accent-800 shadow-sm backdrop-blur-md dark:bg-zinc-900/70 dark:text-accent-200`}
              >
                {item.text}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-300/50 bg-accent-100/80 px-4 py-2 text-xs font-medium text-accent-900 backdrop-blur-xl dark:border-accent-300/20 dark:bg-white/5 dark:text-accent-100"
          >
            <Sparkles className="size-3.5 text-accent-500 dark:text-accent-300" />
            <span>CodeCraftX ile güçlü işe alım süreçleri</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="max-w-4xl text-3xl font-semibold leading-tight text-foreground dark:text-white sm:text-4xl md:text-5xl md:max-w-5xl"
          >
            <span className="block text-balance">Doğru adayı bul. Hızlı işe al.</span>
            <span className="mt-2 block font-semibold text-accent-600 dark:text-accent-400">
              CV analizi ve akıllı eşleşme tek platformda.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground dark:text-zinc-300 md:text-lg"
          >
            {HERO_HINT}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full border border-accent-500/50 from-accent-500 to-accent-400 px-6 text-sm font-semibold text-white shadow-lg shadow-accent-500/25 transition hover:from-accent-600 hover:to-accent-500"
            >
              <Link href="/isveren#sirket-talebi" className="inline-flex items-center gap-2">
                Şirket Talebi Oluştur
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border border-accent-500/30 bg-background/70 px-6 text-sm font-medium text-foreground backdrop-blur-md hover:bg-accent-100/60 dark:bg-background/20 dark:hover:bg-white/10"
            >
              <Link href="/isveren#ozellikler">Özellikleri İncele</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Circle className="size-2 fill-accent-400 text-accent-400" />
            <span>1.5K+ tasarımcı ve geliştirici tarafından tercih edildi</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -5 }}
            animate={{ opacity: 1, y: 0, rotate: -4 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="relative mt-14 origin-top"
          >
            <div className="pointer-events-none absolute -inset-6 -z-10 bg-accent-500/28 blur-2xl dark:bg-accent-400/35" />
            <motion.div
              initial="rest"
              whileHover="open"
              className="relative mx-auto h-[230px] w-full max-w-5xl transform-gpu sm:h-[310px] md:h-[400px] lg:h-[480px]"
            >
              {HERO_STACK.map((layer) => {
                const sources = STACK_SOURCES[layer.id]
                const src = isDark ? sources.dark : sources.light
                const entranceDelay = 0.45 + layer.id * 0.32
                return (
                  <motion.div
                    key={layer.id}
                    variants={{ rest: layer.rest, open: layer.open }}
                    transition={{ type: "spring", stiffness: 180, damping: 20 }}
                    className={`absolute inset-x-0 mx-auto h-[190px] w-[92%] transform-gpu sm:h-[260px] sm:w-[88%] md:h-[340px] lg:h-[430px] lg:w-[82%] ${layer.z}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        opacity: { duration: 0.5, delay: entranceDelay, ease: "easeOut" },
                        scale: { duration: 0.5, delay: entranceDelay, ease: "easeOut" },
                      }}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <div
                        style={{ transform: "translateZ(0)", willChange: "transform" }}
                        className="relative h-full overflow-hidden rounded-2xl border border-accent-500/10 bg-white/80 p-0.5 shadow-[0_24px_64px_rgba(124,45,18,0.18)] dark:border-white/5 dark:bg-zinc-950/80 dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)]"
                      >
                        <Image
                          key={src}
                          src={src}
                          alt="CodeCraftX işveren dashboard görünümü"
                          width={1920}
                          height={1080}
                          priority={layer.id === 2}
                          quality={100}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 95vw, 85vw"
                          className="h-full w-full object-contain rounded-[10px] [image-rendering:-webkit-optimize-contrast]"
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
