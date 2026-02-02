import type { Metadata } from "next"
import { Separator } from "@/components/ui/separator"
import { PricingSection } from "@/components/home/PricingSection"
import { IsverenHero } from "./_components/IsverenHero"
import { IsverenBenefits } from "./_components/IsverenBenefits"
import { IsverenHowItWorks } from "./_components/IsverenHowItWorks"
import { IsverenFeatures } from "./_components/IsverenFeatures"
import { IsverenStats } from "./_components/IsverenStats"
import { IsverenCompanyRequest } from "./_components/IsverenCompanyRequest"
import { IsverenPricingCta } from "./_components/IsverenPricingCta"

export const metadata: Metadata = {
  title: "İşverenler İçin | Codecrafters",
  description: "Yapay zeka destekli işe alım platformu ile doğru yetenekleri bulun. Codecrafters ile işe alım süreçlerinizi optimize edin.",
}

export default function IsverenPage() {
  return (
    <div className="min-h-screen">
      <IsverenHero />
      <Separator className="max-w-6xl mx-auto" />
      <IsverenBenefits />
      <Separator className="max-w-6xl mx-auto" />
      <IsverenHowItWorks />
      <Separator className="max-w-6xl mx-auto" />
      <IsverenFeatures />
      <Separator className="max-w-6xl mx-auto" />
      <IsverenStats />
      <Separator className="max-w-6xl mx-auto" />
      <PricingSection ctaPathPrefix="/isveren" ctaHashAnchor="sirket-talebi" />
      <Separator className="max-w-6xl mx-auto" />
      <IsverenCompanyRequest />
      <Separator className="max-w-6xl mx-auto" />
      <IsverenPricingCta />
    </div>
  )
}
