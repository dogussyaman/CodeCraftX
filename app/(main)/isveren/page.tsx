import type { Metadata } from "next"

import { PricingSection } from "@/components/home/PricingSection"

import { IsverenHeroSection } from "@/components/home/IsverenHeroSection"
import { IsverenBenefits } from "./_components/IsverenBenefits"
import { IsverenHowItWorks } from "./_components/IsverenHowItWorks"
import { IsverenLiveSupportAndMatching } from "./_components/IsverenLiveSupportAndMatching"
import { IsverenFeatures } from "./_components/IsverenFeatures"
import { IsverenStats } from "./_components/IsverenStats"
import { IsverenCompanyRequest } from "./_components/IsverenCompanyRequest"
import { IsverenPricingCta } from "./_components/IsverenPricingCta"

export const metadata: Metadata = {
  title: "İşverenler İçin | CodeCraftX",
  description:
    "Yapay zekâ destekli işe alım platformu ile doğru adayları daha hızlı bulun. CodeCraftX ile işveren süreçlerinizi modernleştirin.",
}

export default function IsverenPage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[48rem] bg-accent-500/20" />

      <IsverenHeroSection />
      <IsverenBenefits />
      <IsverenHowItWorks />
      <IsverenLiveSupportAndMatching />
      <IsverenFeatures />
      <IsverenStats />
      <PricingSection ctaPathPrefix="/isveren" ctaHashAnchor="sirket-talebi" />
      <IsverenCompanyRequest />
      <IsverenPricingCta />
    </div>
  )
}
