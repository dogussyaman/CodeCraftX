import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Search, Clock, BarChart3 } from "lucide-react"

export function IsverenBenefits() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Avantajlar
            </span>
            <h2 className="text-4xl font-bold mt-5 mb-4">Neden Codecrafters?</h2>
            <p className="text-xl text-muted-foreground text-pretty">
              İşe alım süreçlerinizi %90 daha hızlı ve verimli hale getirin.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <Search className="size-6 text-primary" />
                </div>
                <CardTitle>Akıllı Aday Arama</CardTitle>
                <CardDescription>
                  Yapay zeka algoritmalarımız CV&apos;leri analiz ederek size en uygun adayları otomatik olarak bulur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /><span>50+ teknoloji tanıma</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /><span>Deneyim seviyesi analizi</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /><span>Kültürel uyum değerlendirmesi</span></li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <Clock className="size-6 text-primary" />
                </div>
                <CardTitle>Hızlı İşe Alım</CardTitle>
                <CardDescription>
                  Geleneksel işe alım süreçlerinden 10 kat daha hızlı. İlk aday önerilerini dakikalar içinde alın
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /><span>Anında CV analizi</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /><span>Otomatik eşleştirme</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /><span>Hızlı başvuru yönetimi</span></li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <BarChart3 className="size-6 text-primary" />
                </div>
                <CardTitle>Detaylı Raporlama</CardTitle>
                <CardDescription>
                  İşe alım süreçlerinizi analiz edin, performans metriklerinizi takip edin ve optimize edin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /><span>Başvuru istatistikleri</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /><span>Eşleştirme oranları</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /><span>Zaman tasarrufu analizi</span></li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
