"use client"

import { AnimatedTestimonials, type Testimonial } from "@/components/ui/animated-testimonials"

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "The attention to detail and innovative features have completely transformed our workflow.",
    name: "Sarah Chen",
    designation: "Product Manager at TechFlow",
    src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=3560&auto=format&fit=crop",
  },
  {
    quote: "Implementation was seamless and the results exceeded our expectations.",
    name: "Michael Rodriguez",
    designation: "CTO at InnovateSphere",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop",
  },
  {
    quote: "This solution has significantly improved our team's productivity.",
    name: "Emily Watson",
    designation: "Operations Director at CloudScale",
    src: "https://images.unsplash.com/photo-1623582854588-d60de57fa33f?q=80&w=3540&auto=format&fit=crop",
  },
  {
    quote: "Outstanding support and robust features. It delivers on its promises.",
    name: "James Kim",
    designation: "Engineering Lead at DataPro",
    src: "https://images.unsplash.com/photo-1636041293178-808a6762ab39?q=80&w=3464&auto=format&fit=crop",
  },
  {
    quote: "Scalability and performance have been game-changing for our organization.",
    name: "Lisa Thompson",
    designation: "VP of Technology at FutureNet",
    src: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?q=80&w=2592&auto=format&fit=crop",
  },
]

export function ContributorsSection() {
  return (
    <section className="relative w-full py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Katkida Bulunanlar</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Topluluktan gelen geri bildirimler, urunun modern gelisim cizgisini guclendiriyor.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-accent-500/20 bg-white/70 backdrop-blur-xl dark:bg-zinc-900/55">
          <AnimatedTestimonials testimonials={TESTIMONIALS} autoplay />
        </div>
      </div>
    </section>
  )
}
