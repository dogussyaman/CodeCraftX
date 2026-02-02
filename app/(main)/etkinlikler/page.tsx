import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Etkinlikler"),
  description: "Yaklaşan yazılım ve teknoloji etkinlikleri. Konferans, workshop ve meetup'lar.",
  path: "/etkinlikler",
})

export default function EtkinliklerPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute bottom-10 left-10 size-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              Yaklaşan <span className="gradient-text">Etkinlikler</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Sektörün önde gelen etkinliklerine katılın, networking yapın ve kendinizi geliştirin
            </p>
          </div>
        </div>
      </section>

      {/* Empty state - Yakında */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="size-16 text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Şu an listelenecek etkinlik yok</h2>
                <p className="text-muted-foreground mb-6">
                  Yakında burada konferans, workshop ve meetup duyurularını görebileceksiniz.
                </p>
                <Button asChild variant="outline">
                  <Link href="/iletisim">Etkinlik Öner</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Host CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Etkinlik Düzenlemek İster misiniz?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Kendi etkinliğinizi organize edin ve topluluğumuzu davet edin
            </p>
            <Button size="lg" asChild>
              <Link href="/iletisim">Etkinlik Öner</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
