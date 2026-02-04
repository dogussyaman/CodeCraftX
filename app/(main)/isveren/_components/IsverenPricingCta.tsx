import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function IsverenPricingCta() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Hemen Başlayın</h2>
          <p className="text-xl text-muted-foreground mb-8">
            İşe alım süreçlerinizi optimize etmek için bugün kaydolun
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="group text-base font-semibold">
              <Link href="/auth/kayit">
                Ücretsiz Kaydol
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base font-semibold">
              <Link href="/iletisim">Demo Talep Edin</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Kurumsal paketler için{" "}
            <Link href="/iletisim" className="text-primary hover:underline">
              bizimle iletişime geçin
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
