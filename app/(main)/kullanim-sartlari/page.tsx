import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Kullanım Şartları"),
  description: "Codecrafters kullanım şartları. Platform kullanım koşulları ve sorumluluklar.",
  path: "/kullanim-sartlari",
})

export default function KullanimSartlariPage() {
  const tocItems = [
    { id: "genel-hukumler", label: "Genel Hükümler" },
    { id: "hesap-sorumluluklar", label: "Hesap Oluşturma ve Sorumluluklar" },
    { id: "kullanim-kurallari", label: "Kullanım Kuralları" },
    { id: "cv-icerik", label: "CV ve İçerik Paylaşımı" },
    { id: "is-ilanlari", label: "İş İlanları ve Başvurular" },
    { id: "fikri-mulkiyet", label: "Fikri Mülkiyet Hakları" },
    { id: "degisiklikler", label: "Hizmet Değişiklikleri" },
    { id: "sorumluluk-sinirlamasi", label: "Sorumluluk Sınırlaması" },
    { id: "hesap-iptali", label: "Hesap İptali" },
    { id: "uygulanacak-hukuk", label: "Uygulanacak Hukuk" },
    { id: "iletisim", label: "İletişim" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 pt-28 pb-12 max-w-6xl">
          <Badge variant="secondary" className="mb-4">
            Kullanım Koşulları
          </Badge>
          <h1 className="text-4xl font-bold mb-4 gradient-text">Kullanım Şartları</h1>
          <p className="text-muted-foreground max-w-2xl">
            Platformu kullanırken haklarınızı, sorumluluklarınızı ve hizmet kapsamımızı net bir şekilde açıklıyoruz.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24 max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <section id="genel-hukumler" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">1. Genel Hükümler</h2>
            <p className="text-muted-foreground">
              Codecrafters platformunu kullanarak bu kullanım şartlarını kabul etmiş sayılırsınız. Platform üzerinden
              sunulan tüm hizmetler bu şartlara tabidir.
            </p>
          </section>

            <section id="hesap-sorumluluklar" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">2. Hesap Oluşturma ve Sorumluluklar</h2>
            <p className="text-muted-foreground mb-3">Platforma üye olurken:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>18 yaşından büyük olmanız gerekmektedir</li>
              <li>Doğru ve güncel bilgiler sağlamalısınız</li>
              <li>Hesap güvenliğinden siz sorumlusunuz</li>
              <li>Şifrenizi kimseyle paylaşmamalısınız</li>
              <li>Hesabınızda gerçekleşen tüm aktivitelerden sorumlusunuz</li>
            </ul>
          </section>

            <section id="kullanim-kurallari" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">3. Kullanım Kuralları</h2>
            <p className="text-muted-foreground mb-3">Platform kullanırken aşağıdaki kurallara uymalısınız:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Yanlış veya yanıltıcı bilgi paylaşmamak</li>
              <li>Başkalarının haklarını ihlal etmemek</li>
              <li>Spam veya istenmeyen içerik göndermemek</li>
              <li>Platform güvenliğini tehdit edecek faaliyetlerde bulunmamak</li>
              <li>Telif hakkı ihlali yapan içerikler yüklememek</li>
              <li>Diğer kullanıcılara saygılı davranmak</li>
            </ul>
          </section>

            <section id="cv-icerik" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">4. CV ve İçerik Paylaşımı</h2>
            <p className="text-muted-foreground">
              Platforma yüklediğiniz CV ve diğer içeriklerin doğruluğundan siz sorumlusunuz. Yüklenen içeriklerin
              platformda kullanılmasına ve eşleştirme algoritmasında işlenmesine izin vermiş olursunuz.
            </p>
          </section>

            <section id="is-ilanlari" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">5. İş İlanları ve Başvurular</h2>
            <p className="text-muted-foreground mb-3">İş ilanları konusunda:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Şirketler, ilanlarının doğruluğundan sorumludur</li>
              <li>Yanıltıcı veya gerçek dışı ilanlar kaldırılacaktır</li>
              <li>Başvuru süreçleri şirket ile aday arasındadır</li>
              <li>Platform, işe alım kararlarından sorumlu değildir</li>
            </ul>
          </section>

            <section id="fikri-mulkiyet" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">6. Fikri Mülkiyet Hakları</h2>
            <p className="text-muted-foreground">
              Platform üzerindeki tüm içerik, tasarım, logo ve kodlar Codecrafters'ın mülkiyetindedir. İzinsiz
              kopyalama, dağıtma veya ticari kullanım yasaktır.
            </p>
          </section>

            <section id="degisiklikler" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">7. Hizmet Değişiklikleri ve Kesintiler</h2>
            <p className="text-muted-foreground">
              Codecrafters, platformdaki hizmetleri önceden haber vermeksizin değiştirme, güncelleme veya geçici olarak
              durdurma hakkını saklı tutar. Bakım ve güncellemeler sırasında kesintiler yaşanabilir.
            </p>
          </section>

            <section id="sorumluluk-sinirlamasi" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">8. Sorumluluk Sınırlaması</h2>
            <p className="text-muted-foreground">
              Codecrafters, platform kullanımından kaynaklanan dolaylı zararlardan sorumlu değildir. Hizmetler "olduğu
              gibi" sunulmaktadır ve herhangi bir garanti verilmemektedir.
            </p>
          </section>

            <section id="hesap-iptali" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">9. Hesap İptali</h2>
            <p className="text-muted-foreground">
              Kullanım şartlarını ihlal eden hesaplar uyarı verilmeksizin askıya alınabilir veya silinebilir.
              Kullanıcılar istedikleri zaman hesaplarını kapatma hakkına sahiptir.
            </p>
          </section>

            <section id="uygulanacak-hukuk" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">10. Uygulanacak Hukuk</h2>
            <p className="text-muted-foreground">
              Bu kullanım şartları Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlıklar İstanbul mahkemelerinde
              çözülecektir.
            </p>
          </section>

            <section id="iletisim" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">11. İletişim</h2>
            <p className="text-muted-foreground">
              Kullanım şartları hakkında sorularınız için{" "}
              <a href="/iletisim" className="text-primary hover:underline">
                iletişim sayfamızdan
              </a>{" "}
              bize ulaşabilirsiniz.
            </p>
          </section>

            <p className="text-sm text-muted-foreground mt-8 pt-8 border-t">Son güncellenme: 13 Ocak 2025</p>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>İçindekiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {tocItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hızlı Erişim</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <Link href="/gizlilik-politikasi" className="block hover:text-foreground transition-colors">
                  Gizlilik Politikası
                </Link>
                <Link href="/kvkk" className="block hover:text-foreground transition-colors">
                  KVKK Aydınlatma Metni
                </Link>
                <Link href="/cerez-ayarlari" className="block hover:text-foreground transition-colors">
                  Çerez Ayarları
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Güncelleme Bilgisi</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Son güncellenme tarihi 13 Ocak 2025. Önemli değişiklikler için hesap e-postanıza bildirim gönderilir.
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
