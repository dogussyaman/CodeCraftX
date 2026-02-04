import Link from "next/link"
import { Button } from "@/components/ui/button"

export function JobsCta() {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">İlan Vermek İster misiniz?</h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Binlerce yetenekli yazılımcıya ulaşın ve ekibinizi doğru adaylarla büyütün.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="text-base font-semibold">
              <Link href="/auth/kayit">İK Olarak Kayıt Ol</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base font-semibold">
              <Link href="/iletisim">Detayları Sorun</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
