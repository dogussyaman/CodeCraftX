import type { Metadata } from "next"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Kullanım Şartları"),
  description: "Codecrafters kullanım şartları. Platform kullanım koşulları ve sorumluluklar.",
  path: "/kullanim-sartlari",
})

export default function KullanimSartlariPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-32 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 gradient-text">Kullanım Şartları</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Genel Hükümler</h2>
            <p className="text-muted-foreground">
              Codecrafters platformunu kullanarak bu kullanım şartlarını kabul etmiş sayılırsınız. Platform üzerinden
              sunulan tüm hizmetler bu şartlara tabidir.
            </p>
          </section>

          <section>
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

          <section>
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

          <section>
            <h2 className="text-2xl font-bold mb-4">4. CV ve İçerik Paylaşımı</h2>
            <p className="text-muted-foreground">
              Platforma yüklediğiniz CV ve diğer içeriklerin doğruluğundan siz sorumlusunuz. Yüklenen içeriklerin
              platformda kullanılmasına ve eşleştirme algoritmasında işlenmesine izin vermiş olursunuz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. İş İlanları ve Başvurular</h2>
            <p className="text-muted-foreground mb-3">İş ilanları konusunda:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Şirketler, ilanlarının doğruluğundan sorumludur</li>
              <li>Yanıltıcı veya gerçek dışı ilanlar kaldırılacaktır</li>
              <li>Başvuru süreçleri şirket ile aday arasındadır</li>
              <li>Platform, işe alım kararlarından sorumlu değildir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Fikri Mülkiyet Hakları</h2>
            <p className="text-muted-foreground">
              Platform üzerindeki tüm içerik, tasarım, logo ve kodlar Codecrafters'ın mülkiyetindedir. İzinsiz
              kopyalama, dağıtma veya ticari kullanım yasaktır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Hizmet Değişiklikleri ve Kesintiler</h2>
            <p className="text-muted-foreground">
              Codecrafters, platformdaki hizmetleri önceden haber vermeksizin değiştirme, güncelleme veya geçici olarak
              durdurma hakkını saklı tutar. Bakım ve güncellemeler sırasında kesintiler yaşanabilir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Sorumluluk Sınırlaması</h2>
            <p className="text-muted-foreground">
              Codecrafters, platform kullanımından kaynaklanan dolaylı zararlardan sorumlu değildir. Hizmetler "olduğu
              gibi" sunulmaktadır ve herhangi bir garanti verilmemektedir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Hesap İptali</h2>
            <p className="text-muted-foreground">
              Kullanım şartlarını ihlal eden hesaplar uyarı verilmeksizin askıya alınabilir veya silinebilir.
              Kullanıcılar istedikleri zaman hesaplarını kapatma hakkına sahiptir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Uygulanacak Hukuk</h2>
            <p className="text-muted-foreground">
              Bu kullanım şartları Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlıklar İstanbul mahkemelerinde
              çözülecektir.
            </p>
          </section>

          <section>
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
      </div>
    </div>
  )
}
