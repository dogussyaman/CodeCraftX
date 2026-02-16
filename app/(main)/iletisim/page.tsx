"use client"

import { Separator } from "@/components/ui/separator"
import { ContactFaqAccordion } from "./_components/ContactFaqAccordion"
import { ContactFormCard } from "./_components/ContactFormCard"
import { ContactInfoCard } from "./_components/ContactInfoCard"
import { OfficeVisitSection } from "./_components/OfficeVisitSection"

export default function IletisimPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden pb-16 pt-32 md:pb-20">
        <div className="absolute left-10 top-20 size-96 rounded-full bg-accent-400/15 blur-[120px]" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-balance text-5xl font-bold md:text-6xl">
              <span className="gradient-text">İletişime</span> Geçin
            </h1>
            <p className="mb-8 text-pretty text-xl text-muted-foreground">
              Sorularınız, önerileriniz veya iş birliği teklifleriniz için bize ulaşın.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6 md:max-w-5xl md:space-y-8">
            <div className="grid items-start gap-6 md:grid-cols-2">
              <ContactInfoCard />
              <ContactFaqAccordion />
            </div>
            <ContactFormCard />
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl border-accent-500/20" />
      <OfficeVisitSection />
    </div>
  )
}
