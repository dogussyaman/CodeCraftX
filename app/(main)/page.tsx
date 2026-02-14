"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
      // Eğer ana sayfaya code veya error ile gelinmişse, bu bir OAuth dönüşüdür
      // ve yanlışlıkla ana sayfaya yönlendirilmiştir.
      // Callback sayfasına yönlendir.
      const params = new URLSearchParams(searchParams.toString())
      router.replace(`/auth/callback?${params.toString()}`)
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen">
      {/* Background Effects are now handled globally in layout.tsx */}

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
