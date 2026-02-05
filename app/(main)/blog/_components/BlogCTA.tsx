import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export function BlogCTA() {
  return (
    <section className="relative w-full overflow-hidden rounded-t-[2rem] bg-[#0f2d3a] py-16 md:py-20 lg:py-24">
      {/* Sağ tarafta yarı taşan, yazılım temalı ağ grafiği */}
      <div className="pointer-events-none absolute -right-[20%] -top-[15%] bottom-0 w-[75%] min-w-[320px] max-w-[700px] opacity-60 md:opacity-70">
        <svg
          viewBox="0 0 400 300"
          className="h-full w-full object-contain object-right"
          aria-hidden
        >
          {/* Arka plan nokta ızgarası */}
          <defs>
            <pattern id="blog-cta-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="#67e8f9" fillOpacity="0.25" />
            </pattern>
            <linearGradient id="cta-line-a" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#a5f3fc" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="cta-line-b" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="cta-line-c" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="cta-line-d" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#blog-cta-dots)" />
          {/* Bağlantı çizgileri – header ile aynı cyan ailesi */}
          <path d="M 80 80 Q 180 40 280 100 T 380 120" fill="none" stroke="url(#cta-line-a)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" />
          <path d="M 60 180 Q 160 140 260 200 T 400 160" fill="none" stroke="url(#cta-line-b)" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.75" />
          <path d="M 100 220 Q 200 180 320 240" fill="none" stroke="url(#cta-line-c)" strokeWidth="1" opacity="0.65" />
          <path d="M 40 100 Q 150 80 250 160 T 380 220" fill="none" stroke="url(#cta-line-d)" strokeWidth="1.3" opacity="0.7" />
          <path d="M 120 40 Q 220 100 300 60 T 400 80" fill="none" stroke="url(#cta-line-a)" strokeWidth="1.2" strokeDasharray="5 2" opacity="0.6" />
          {/* Noktalar – cyan/sky tonları */}
          <circle cx="80" cy="80" r="4" fill="#a5f3fc" opacity="0.9" />
          <circle cx="280" cy="100" r="5" fill="#67e8f9" opacity="0.9" />
          <circle cx="380" cy="120" r="3" fill="#22d3ee" opacity="0.9" />
          <circle cx="60" cy="180" r="4" fill="#e0f2fe" opacity="0.85" />
          <circle cx="260" cy="200" r="3" fill="#a5f3fc" opacity="0.85" />
          <circle cx="100" cy="220" r="4" fill="#67e8f9" opacity="0.8" />
          <circle cx="320" cy="240" r="3" fill="#38bdf8" opacity="0.8" />
          <circle cx="120" cy="40" r="3" fill="#22d3ee" opacity="0.9" />
          <circle cx="300" cy="60" r="4" fill="#e0f2fe" opacity="0.8" />
        </svg>
      </div>

      <div className="container relative mx-auto flex max-w-6xl flex-col items-start px-4 md:flex-row md:items-center md:justify-between md:gap-12">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
            Geliştirme inovasyonunuzu harekete geçirmeye hazır mısınız?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/85 md:text-lg">
            CodeCraftX ile doğru yetenekleri bulun, eşleştirmenin gücünü deneyimleyin.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-cyan-400 text-[#0f2d3a] hover:bg-cyan-300">
              <Link href="/auth/kayit">Ücretsiz Başla</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/#ozellikler" className="inline-flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-white/20">
                  <Play className="size-4 fill-white text-white" />
                </span>
                Videoyu İzle
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
