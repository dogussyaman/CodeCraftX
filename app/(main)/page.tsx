"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Glow from "@/components/ui/glow"
import {
  HeroSection,
  FeaturesSection,
  HowItWorksSection,
  PricingSection,
  TestimonialsMarqueeSection,
  StatsSection,
  CtaBandSection,
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
      <div className="pointer-events-none absolute left-1/2 top-16 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-accent-500/30 blur-3xl dark:bg-accent-500/40" />
      <div className="pointer-events-none absolute right-[10%] top-[30rem] -z-10 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl dark:bg-accent-500/30" />
      <Glow variant="above" className="pointer-events-none -z-10 opacity-55 dark:opacity-70" />

      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsMarqueeSection />
        <HowItWorksSection />
        <PricingSection ctaPathPrefix="/isveren" ctaHashAnchor="sirket-talebi" />
        <StatsSection />
        <CtaBandSection />
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
