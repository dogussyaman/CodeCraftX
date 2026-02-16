import type { Metadata } from "next"
import Link from "next/link"
import { Calendar } from "lucide-react"

import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Etkinlikler"),
  description: "Yaklaşan yazılım ve teknoloji etkinlikleri. Konferans, workshop ve meetup'lar.",
  path: "/etkinlikler",
})

export default function EtkinliklerPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden pb-20 pt-32">
        <div className="absolute bottom-10 left-10 size-96 rounded-full bg-accent-400/15 blur-[120px]" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-balance text-5xl font-bold md:text-6xl">
              Yaklaşan <span className="gradient-text">Etkinlikler</span>
            </h1>
            <p className="mb-8 text-pretty text-xl text-muted-foreground">
              Sektörün önde gelen etkinliklerine katılın, networking yapın ve kendinizi geliştirin.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-xl">
            <Card className="border-dashed border-accent-500/30 bg-white/70 dark:bg-zinc-900/60">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="mb-4 size-16 text-muted-foreground/60" />
                <h2 className="mb-2 text-xl font-semibold">Şu an listelenecek etkinlik yok</h2>
                <p className="mb-6 text-muted-foreground">Yakında konferans, workshop ve meetup duyurularını burada görebileceksiniz.</p>
                <Button asChild variant="outline" className="border-accent-500/30">
                  <Link href="/iletisim">Etkinlik Öner</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/20 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-4xl font-bold">Etkinlik Düzenlemek İster misiniz?</h2>
            <p className="mb-8 text-xl text-muted-foreground">Kendi etkinliğinizi organize edin ve topluluğumuzu davet edin.</p>
            <Button size="lg" asChild className="bg-gradient-to-r from-accent-500 to-accent-400 text-white hover:from-accent-600 hover:to-accent-500">
              <Link href="/iletisim">Etkinlik Öner</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
