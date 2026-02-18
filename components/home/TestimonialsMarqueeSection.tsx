import { Card, CardContent } from "@/components/ui/card"
import { Marquee } from "@/components/ui/marquee"
import { Star } from "lucide-react"

const TESTIMONIALS = [
  {
    name: "Deniz Aksoy",
    role: "Frontend Engineer",
    company: "PixelForge",
    quote: "Aday eşleştirme kalitesi yüksek. Uygun profilleri çok daha hızlı buluyoruz.",
  },
  {
    name: "Ece Yıldız",
    role: "İK Lideri",
    company: "Loop Labs",
    quote: "Arayüz modern ve süreçler akıcı. Ekip içi koordinasyon belirgin şekilde hızlandı.",
  },
  {
    name: "Mert Karaca",
    role: "CTO",
    company: "Brightworks",
    quote: "Raporlama ekranları sayesinde karar alma sürecimiz daha net ve hızlı.",
  },
  {
    name: "Selin Güven",
    role: "Ürün Yöneticisi",
    company: "NovaStack",
    quote: "Kullanıcı deneyimi güçlü. Yeni ekip arkadaşları sisteme hızla adapte oluyor.",
  },
  {
    name: "Arda Şen",
    role: "Tech Recruiter",
    company: "CloudMinds",
    quote: "Aday havuzu yönetimi dağınık değil. Her şey tek ekranda net ve düzenli.",
  },
  {
    name: "Zeynep Kılıç",
    role: "People Ops",
    company: "Skyline",
    quote: "Güvenlik ve uyumluluk tarafı beklentimizi karşıladı. Kurumsal olarak rahatız.",
  },
  {
    name: "Onur Demir",
    role: "Full Stack Developer",
    company: "Crafted",
    quote: "Profilimi yönetmek ve uygun ilanları görmek çok kolay. Süreç şeffaf.",
  },
  {
    name: "Buse Çetin",
    role: "Operasyon Müdürü",
    company: "KiteWorks",
    quote: "Otomatik filtreleme ile ciddi zaman kazandık. Ekip verimliliği arttı.",
  },
]

const firstRow = TESTIMONIALS.slice(0, 4)
const secondRow = TESTIMONIALS.slice(4)

function TestimonialCard({
  name,
  role,
  company,
  quote,
}: {
  name: string
  role: string
  company: string
  quote: string
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")

  return (
    <Card className="w-80 border border-accent-500/20 bg-white/75 shadow-sm backdrop-blur-xl dark:bg-zinc-900/65">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full from-accent-500/25 via-accent-500/20 to-accent-500/10 text-sm font-semibold text-foreground">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground">
                {role} - {company}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 text-accent-500 dark:text-accent-300">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="size-4 fill-current" />
            ))}
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{quote}</p>
      </CardContent>
    </Card>
  )
}

export function TestimonialsMarqueeSection() {
  return (
    <section className="relative w-full overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 from-transparent via-accent-100/40 to-transparent dark:via-accent-500/5" />
      {/* Başlık alanı: max-width container içinde, ortada */}
      <div className="container relative z-10 mx-auto mb-12 px-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-100/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-800 dark:bg-accent-500/10 dark:text-accent-200">
          Yorumlar
        </span>
        <h2 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">
          Topluluktan gerçek deneyimler
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
          CodeCraftX kullanıcıları, işe alım ve kariyer süreçlerinde yarattığı etkiyi paylaşıyor.
        </p>
      </div>

      {/* Marquee: kenarlar mask ile yumuşak fade/blur geçişi */}
      <div className="relative z-10 w-full overflow-hidden">
        <div
          className="w-full space-y-6 [mask-image:linear-gradient(to_right,transparent_0,black_80px,black_calc(100%-80px),transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0,black_80px,black_calc(100%-80px),transparent_100%)]"
          style={{
            maskImage: "linear-gradient(to right, transparent 0, black 80px, black calc(100% - 80px), transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0, black 80px, black calc(100% - 80px), transparent 100%)",
          }}
        >
          <Marquee pauseOnHover repeat={6} className="w-full [--duration:45s]">
            {firstRow.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </Marquee>
          <Marquee pauseOnHover reverse repeat={6} className="w-full [--duration:55s]">
            {secondRow.map((testimonial) => (
              <TestimonialCard key={testimonial.name} {...testimonial} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  )
}
