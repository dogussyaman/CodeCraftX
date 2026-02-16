"use client"

import { AnimatedTestimonials, type Testimonial } from "@/components/ui/animated-testimonials"

const CONTRIBUTORS: Testimonial[] = [
  {
    quote: "Detaylara verilen özen ve yenilikçi özellikler iş süreçlerimizi baştan aşağı değiştirdi.",
    name: "Sarah Chen",
    designation: "Ürün Yöneticisi, TechFlow",
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop",
  },
  {
    quote: "Entegrasyon sorunsuzdu, sonuçlar beklentilerimizin üzerindeydi.",
    name: "Michael Rodriguez",
    designation: "CTO, InnovateSphere",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop",
  },
  {
    quote: "Bu çözüm ekibimizin verimliliğini belirgin şekilde artırdı.",
    name: "Emily Watson",
    designation: "Operasyon Direktörü, CloudScale",
    src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop",
  },
  {
    quote: "Üstün destek ve sağlam özellikler. Vaadettiğini fazlasıyla veriyor.",
    name: "James Kim",
    designation: "Mühendislik Lideri, DataPro",
    src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop",
  },
  {
    quote: "Ölçeklenebilirlik ve performans organizasyonumuz için oyun değiştirici oldu.",
    name: "Lisa Thompson",
    designation: "Teknoloji VP, FutureNet",
    src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop",
  },
]

export function ContributorsSection() {
  return (
    <section className="relative w-full py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full border border-accent-500/30 bg-accent-100/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-800 dark:bg-accent-500/15 dark:text-accent-200">
            Topluluk
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Katkıda Bulunanlar
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Topluluktan gelen geri bildirimler, ürünün modern gelişim çizgisini güçlendiriyor.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-accent-500/20 bg-white/70 backdrop-blur-xl dark:bg-zinc-900/55">
          <AnimatedTestimonials testimonials={CONTRIBUTORS} autoplay={false} />
        </div>
      </div>
    </section>
  )
}
