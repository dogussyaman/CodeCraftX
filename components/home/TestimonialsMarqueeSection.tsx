import { Marquee } from "@/components/ui/marquee"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const TESTIMONIALS = [
  {
    name: "Deniz Aksoy",
    role: "Frontend Engineer",
    company: "PixelForge",
    quote:
      "Aday eşleştirme kalitesi müthiş. İlanımıza uygun profilleri dakikalar içinde bulduk.",
  },
  {
    name: "Ece Yıldız",
    role: "İK Lideri",
    company: "Loop Labs",
    quote:
      "Arayüz modern, süreçler akıcı. Ekip içi koordinasyonumuz ciddi şekilde hızlandı.",
  },
  {
    name: "Mert Karaca",
    role: "CTO",
    company: "Brightworks",
    quote:
      "Raporlama ve analiz ekranları sayesinde doğru kararları çok daha hızlı alıyoruz.",
  },
  {
    name: "Selin Güven",
    role: "Ürün Yöneticisi",
    company: "NovaStack",
    quote:
      "Kullanıcı deneyimi çok iyi düşünülmüş. Yeni ekip arkadaşlarını kısa sürede adapte ettik.",
  },
  {
    name: "Arda Şen",
    role: "Tech Recruiter",
    company: "CloudMinds",
    quote:
      "Aday havuzu yönetimi artık dağınık değil. Her şey tek ekranda net ve düzenli.",
  },
  {
    name: "Zeynep Kılıç",
    role: "People Ops",
    company: "Skyline",
    quote:
      "KVKK uyumluluğu ve güvenlik tarafı içimizi rahatlattı. Kurumsal beklentileri karşılıyor.",
  },
  {
    name: "Onur Demir",
    role: "Full Stack Developer",
    company: "Crafted",
    quote:
      "Kendi profilimi düzenlemek ve doğru ilanlarla eşleşmek çok kolay. Süreç şeffaf ilerliyor.",
  },
  {
    name: "Buse Çetin",
    role: "Operasyon Müdürü",
    company: "KiteWorks",
    quote:
      "Otomatik filtreleme sayesinde zaman kazandık. Ekibin günlük verimliliği arttı.",
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
    <Card className="w-80 border-border/60 bg-card/70 backdrop-blur-sm shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/20 flex items-center justify-center text-sm font-semibold text-foreground">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground">
                {role} · {company}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 text-primary">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="size-4 fill-primary" />
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
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
      <div className="container relative mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Yorumlar
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground">
            Topluluktan gelen gerçek deneyimler
          </h2>
          <p className="mt-3 text-base text-muted-foreground max-w-2xl mx-auto">
            CodeCraftX kullanıcıları işe alım ve kariyer süreçlerinde nasıl değer
            yarattığımızı paylaşıyor.
          </p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
          <div className="space-y-6">
            <Marquee pauseOnHover className="[--duration:45s]">
              {firstRow.map((testimonial) => (
                <TestimonialCard key={testimonial.name} {...testimonial} />
              ))}
            </Marquee>
            <Marquee pauseOnHover reverse className="[--duration:55s]">
              {secondRow.map((testimonial) => (
                <TestimonialCard key={testimonial.name} {...testimonial} />
              ))}
            </Marquee>
          </div>
        </div>
      </div>
    </section>
  )
}
