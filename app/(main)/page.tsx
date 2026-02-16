"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "motion/react"
import Glow from "@/components/ui/glow"
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  ContributorsSection,
  PricingSection,
  TestimonialsMarqueeSection,
} from "@/components/home"

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (code || error) {
      const params = new URLSearchParams(searchParams.toString())
      router.replace(`/auth/callback?${params.toString()}`)
    }
  }, [searchParams, router])

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[58rem] bg-accent-500/20 dark:bg-accent-500/30" />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-16 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-accent-500/30 blur-3xl dark:bg-accent-500/40"
        animate={{ opacity: [0.45, 0.82, 0.45], scale: [1, 1.15, 1], y: [0, -24, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute right-[10%] top-[30rem] -z-10 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl dark:bg-accent-500/30"
        animate={{ opacity: [0.24, 0.52, 0.24], x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <Glow variant="above" className="pointer-events-none -z-10 opacity-55 dark:opacity-70" />

      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsMarqueeSection />
        <HowItWorksSection />
        <PricingSection ctaPathPrefix="/isveren" ctaHashAnchor="sirket-talebi" />
        <ContributorsSection />
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HomeContent />
    </Suspense>
  )
}
