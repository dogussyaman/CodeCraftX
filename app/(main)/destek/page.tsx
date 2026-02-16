"use client"

import { Separator } from "@/components/ui/separator"
import { DestekAlert } from "./_components/DestekAlert"
import { DestekChannels } from "./_components/DestekChannels"
import { DestekCtaCard } from "./_components/DestekCtaCard"
import { DestekFaqSection } from "./_components/DestekFaqSection"
import { DestekHero } from "./_components/DestekHero"
import { DestekTicketCard } from "./_components/DestekTicketCard"

export default function DestekPage() {
  return (
    <div className="min-h-screen bg-background">
      <DestekHero />
      <DestekAlert />
      <DestekChannels />
      <DestekTicketCard />
      <Separator className="mx-auto max-w-6xl border-accent-500/20" />
      <DestekFaqSection />
      <Separator className="mx-auto max-w-6xl border-accent-500/20" />
      <DestekCtaCard />
    </div>
  )
}
