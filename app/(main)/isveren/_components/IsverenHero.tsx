import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Shield, TrendingUp, ArrowRight } from "lucide-react"

export function IsverenHero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute top-20 right-10 size-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-10 left-10 size-96 bg-secondary/10 rounded-full blur-[120px]" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            <span className="gradient-text">Doğru Yetenekleri</span> Bulun
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Yapay zeka destekli işe alım platformu ile en uygun yazılım geliştiricilerini keşfedin
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Zap className="mr-1 h-3 w-3" />
              Yapay Zeka Destekli
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Shield className="mr-1 h-3 w-3" />
              Güvenli
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <TrendingUp className="mr-1 h-3 w-3" />
              Hızlı Eşleştirme
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="group">
              <Link href="/iletisim">
                Demo Talep Edin
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
