import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Award,
  Code2,
  Heart,
  Lightbulb,
  Rocket,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Hakkımızda | CodeCraftX",
  description: "CodeCraftX, geliştiricileri ve şirketleri yapay zekâ destekli eşleştirme ile buluşturan modern kariyer platformudur.",
}

const values = [
  {
    title: "İnsan Odaklılık",
    description: "Her geliştiricinin benzersiz bir hikâyesi olduğuna inanıyoruz. Sadece CV'ye değil, potansiyele de odaklanıyoruz.",
    icon: Heart,
  },
  {
    title: "İnovasyon",
    description: "Sürekli gelişen teknolojiyle işe alım süreçlerini yeniden tanımlıyor, sektöre yenilikçi çözümler sunuyoruz.",
    icon: Lightbulb,
  },
  {
    title: "Şeffaflık",
    description: "Süreçlerimiz açık, anlaşılır ve ölçülebilir. Şirketler ve adaylar her adımı net şekilde takip edebilir.",
    icon: Shield,
  },
  {
    title: "Mükemmellik",
    description: "Hem işveren hem geliştirici tarafında en iyi deneyimi sunmak için kalite standardımızı sürekli yükseltiyoruz.",
    icon: Award,
  },
]

const highlights = [
  { value: "10K+", label: "Aktif Geliştirici", icon: Users },
  { value: "500+", label: "İşveren Ortağı", icon: Target },
  { value: "15K+", label: "Başarılı Eşleşme", icon: TrendingUp },
  { value: "%95", label: "Memnuniyet", icon: Zap },
]

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden pb-20 pt-32">
        <div className="absolute right-10 top-20 size-96 rounded-full bg-accent-400/15 blur-[120px]" />
        <div className="absolute bottom-10 left-10 size-96 rounded-full bg-accent-300/15 blur-[120px]" />

        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-balance text-5xl font-bold md:text-6xl">
              <span className="gradient-text">CodeCraftX</span> Hakkında
            </h1>
            <p className="mb-8 text-pretty text-xl text-muted-foreground">
              Türkiye'nin yazılım odaklı en modern eşleştirme platformlarından biri olarak, doğru yetenek ile doğru fırsatı bir araya getiriyoruz.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                <Zap className="mr-1 h-3 w-3" />
                Yapay Zekâ Destekli
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                <Shield className="mr-1 h-3 w-3" />
                Güvenli
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                <TrendingUp className="mr-1 h-3 w-3" />
                Hızlı Büyüyen
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <Target className="size-4" />
                Misyonumuz
              </div>
              <h2 className="mb-6 text-4xl font-bold">Doğru Yetenekle Doğru Fırsatı Buluşturuyoruz</h2>
              <p className="mb-4 text-lg text-muted-foreground">
                CodeCraftX; geliştiriciler, şirketler ve insan kaynakları ekipleri için uçtan uca modern bir işe alım deneyimi sunar.
              </p>
              <p className="mb-4 text-lg text-muted-foreground">
                Gelişmiş CV analizi ve akıllı eşleştirme algoritmaları sayesinde manuel yükü azaltır, kaliteli adaylara daha hızlı ulaşılmasını sağlar.
              </p>
              <p className="text-lg text-muted-foreground">
                Vizyonumuz, Türkiye'nin dijital dönüşümüne insan odaklı ve ölçülebilir işe alım süreçleriyle katkı sunmaktır.
              </p>
            </div>

            <div className="rounded-2xl border border-accent-500/20 bg-white/75 p-8 backdrop-blur-xl dark:bg-zinc-900/60">
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl bg-background/70 p-4">
                  <Code2 className="mt-0.5 size-7 text-primary" />
                  <div>
                    <h3 className="font-semibold">Akıllı Eşleştirme</h3>
                    <p className="text-sm text-muted-foreground">Yapay zekâ destekli öneri altyapısı</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-background/70 p-4">
                  <Users className="mt-0.5 size-7 text-primary" />
                  <div>
                    <h3 className="font-semibold">Topluluk Gücü</h3>
                    <p className="text-sm text-muted-foreground">Aktif geliştirici ağı ve bilgi paylaşımı</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-background/70 p-4">
                  <Rocket className="mt-0.5 size-7 text-primary" />
                  <div>
                    <h3 className="font-semibold">Hızlı Süreç</h3>
                    <p className="text-sm text-muted-foreground">Dakikalar içinde aday görünürlüğü</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl border-accent-500/20" />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-10 text-center text-3xl font-bold">Değerlerimiz</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {values.map((item) => (
                <Card key={item.title} className="border-accent-500/20 bg-white/75 dark:bg-zinc-900/60">
                  <CardHeader>
                    <div className="mb-2 flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl border-accent-500/20" />

      <section className="bg-muted/20 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
            {highlights.map((item) => (
              <div key={item.label} className="text-center">
                <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="size-8" />
                </div>
                <div className="gradient-text mb-2 text-4xl font-bold md:text-5xl">{item.value}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-4xl font-bold">Hemen Başlayın</h2>
            <p className="mb-8 text-xl text-muted-foreground">Kariyerinizde bir sonraki adımı atmak için topluluğumuza katılın.</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild className="group bg-gradient-to-r from-accent-500 to-accent-400 text-white hover:from-accent-600 hover:to-accent-500">
                <Link href="/auth/kayit">
                  Ücretsiz Kaydol
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-accent-500/30">
                <Link href="/iletisim">Bize Ulaşın</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
