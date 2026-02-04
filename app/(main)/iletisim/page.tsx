"use client"

import { Separator } from "@/components/ui/separator"
import { ContactInfoCard } from "./_components/ContactInfoCard"
import { ContactFaqAccordion } from "./_components/ContactFaqAccordion"
import { ContactFormCard } from "./_components/ContactFormCard"
import { OfficeVisitSection } from "./_components/OfficeVisitSection"

export default function IletisimPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative pt-32 pb-20 overflow-hidden">
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
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Size Nasıl Yardımcı Olabiliriz?</h2>
              <p className="text-lg text-muted-foreground text-pretty">
                İletişim kanallarımız, sık sorulan sorular ve mesaj formu tek bir yerde.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <ContactInfoCard />
                <ContactFaqAccordion />
              </div>
              <ContactFormCard />
            </div>
          </div>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />
      <OfficeVisitSection />
    </div>
  )
}
