"use client"

import { Separator } from "@/components/ui/separator"
import { DestekHero } from "./_components/DestekHero"
import { DestekAlert } from "./_components/DestekAlert"
import { DestekChannels } from "./_components/DestekChannels"
import { DestekTicketCard } from "./_components/DestekTicketCard"
import { DestekFaqSection } from "./_components/DestekFaqSection"
import { DestekCtaCard } from "./_components/DestekCtaCard"

export default function DestekPage() {
  return (
    <div className="min-h-screen bg-background">
      <DestekHero />
      <DestekAlert />
      <DestekChannels />
      <DestekTicketCard />
      <Separator className="max-w-6xl mx-auto" />
      <DestekFaqSection />
      <Separator className="max-w-6xl mx-auto" />
      <DestekCtaCard />
    </div>
  )
}
