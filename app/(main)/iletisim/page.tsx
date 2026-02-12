"use client"

import { Separator } from "@/components/ui/separator"
import { ContactInfoCard } from "./_components/ContactInfoCard"
import { ContactFaqAccordion } from "./_components/ContactFaqAccordion"
import { ContactFormCard } from "./_components/ContactFormCard"
import { OfficeVisitSection } from "./_components/OfficeVisitSection"

export default function IletisimPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-32 pb-16 md:pb-20 overflow-hidden">
        <div className="absolute top-20 left-10 size-96 bg-accent/10 rounded-full blur-[120px]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              <span className="gradient-text">İletişime</span> Geçin
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Sorularınız, önerileriniz veya iş birliği teklifleriniz için bize ulaşın
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl md:max-w-5xl mx-auto space-y-6 md:space-y-8">
            <div className="grid gap-6 md:grid-cols-2 items-start">
              <ContactInfoCard />
              <ContactFaqAccordion />
            </div>
            <ContactFormCard />
          </div>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />
      <OfficeVisitSection />
    </div>
  )
}
