import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function IsverenPricingCta() {
  return (
    <section className="bg-muted/20 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold">Hemen Başlayın</h2>
          <p className="mb-8 text-xl text-muted-foreground">İşe alım süreçlerinizi optimize etmek için bugün kaydolun.</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="group bg-gradient-to-r from-accent-500 to-accent-400 text-white hover:from-accent-600 hover:to-accent-500">
              <Link href="/auth/kayit">
                Ücretsiz Kaydol
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-accent-500/30">
              <Link href="/iletisim">Demo Talep Edin</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Kurumsal paketler için
            <Link href="/iletisim" className="ml-1 text-primary hover:underline">
              bizimle iletişime geçin
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
