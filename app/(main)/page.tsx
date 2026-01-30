"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import {
  HeroSection,
  FeaturesSection,
  PricingSection,
  HowItWorksSection,
  CTASection,
  HomeMarquee,
} from "@/components/home"

const ROLES_HIDE_PRICING = ["admin", "platform_admin", "developer", "mt"] as const

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, role } = useAuth()

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

  const hidePricingSection =
    user &&
    role &&
    ROLES_HIDE_PRICING.includes(role as (typeof ROLES_HIDE_PRICING)[number])

  return (
    <div className="min-h-screen">
      {/* Background Effects are now handled globally in layout.tsx */}

      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <HomeMarquee />
        {!hidePricingSection && <PricingSection />}
        <CTASection />
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
