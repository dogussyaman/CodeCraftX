import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Search, Clock, BarChart3 } from "lucide-react"

export function IsverenBenefits() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Neden CodeCraftX?</h2>
            <p className="text-xl text-muted-foreground">İşe alım süreçlerinizi %90 daha hızlı ve verimli hale getirin.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-accent-500/20 bg-white/75 transition-colors hover:border-primary/50 dark:bg-zinc-900/60">
              <CardHeader>
                <div className="mb-4 w-fit rounded-lg bg-primary/10 p-3">
                  <Search className="size-6 text-primary" />
                </div>
                <CardTitle>Akıllı Aday Arama</CardTitle>
                <CardDescription>
                  Yapay zekâ algoritmaları CV'leri analiz eder ve ihtiyacınıza en uygun adayları otomatik listeler.
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

            <Card className="border-accent-500/20 bg-white/75 transition-colors hover:border-primary/50 dark:bg-zinc-900/60">
              <CardHeader>
                <div className="mb-4 w-fit rounded-lg bg-primary/10 p-3">
                  <Clock className="size-6 text-primary" />
                </div>
                <CardTitle>Hızlı İşe Alım</CardTitle>
                <CardDescription>
                  Geleneksel süreçlere göre çok daha hızlı ilerleyin. İlk aday önerilerini dakikalar içinde alın.
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

            <Card className="border-accent-500/20 bg-white/75 transition-colors hover:border-primary/50 dark:bg-zinc-900/60">
              <CardHeader>
                <div className="mb-4 w-fit rounded-lg bg-primary/10 p-3">
                  <BarChart3 className="size-6 text-primary" />
                </div>
                <CardTitle>Detaylı Raporlama</CardTitle>
                <CardDescription>
                  İşe alım performansınızı anlık takip edin, metriklerle karar verin ve süreçleri optimize edin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /><span>Başvuru istatistikleri</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" /><span>Eşleşme oranları</span></li>
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
