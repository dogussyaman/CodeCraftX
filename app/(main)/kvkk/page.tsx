import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CONTACT } from "@/lib/constants"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("KVKK Aydınlatma Metni"),
  description: "Codecrafters KVKK aydınlatma metni. Kişisel verilerin işlenmesi ve haklarınız.",
  path: "/kvkk",
})

export default function KVKKPage() {
  const tocItems = [
    { id: "veri-sorumlusu", label: "Veri Sorumlusu" },
    { id: "islenen-veriler", label: "İşlenen Kişisel Veriler" },
    { id: "isleme-amaclari", label: "İşleme Amaçları" },
    { id: "aktarim", label: "Verilerin Aktarılması" },
    { id: "toplama-yontemi", label: "Toplanma Yöntemi" },
    { id: "saklama-suresi", label: "Saklama Süresi" },
    { id: "haklar", label: "KVKK Kapsamındaki Haklar" },
    { id: "basvuru", label: "Başvuru Yöntemi" },
    { id: "iletisim", label: "İletişim" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 pt-28 pb-12 max-w-6xl">
          <Badge variant="secondary" className="mb-4">
            KVKK Bilgilendirme
          </Badge>
          <h1 className="text-4xl font-bold mb-4 gradient-text">KVKK Aydınlatma Metni</h1>
          <p className="text-muted-foreground max-w-2xl">
            Kişisel verilerinizin hangi amaçlarla işlendiğini, nasıl saklandığını ve haklarınızı özetliyoruz.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24 max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <section id="veri-sorumlusu" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">1. Veri Sorumlusu</h2>
            <p className="text-muted-foreground">
              6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz; veri sorumlusu
              sıfatıyla Codecrafters tarafından aşağıda açıklanan kapsamda işlenebilecektir.
            </p>
          </section>

            <section id="islenen-veriler" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">2. İşlenen Kişisel Veriler</h2>
            <p className="text-muted-foreground mb-3">Platformumuzda işlenen kişisel veri kategorileri:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                <strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası (isteğe bağlı)
              </li>
              <li>
                <strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres
              </li>
              <li>
                <strong>Özlük Bilgileri:</strong> Eğitim durumu, iş deneyimi, sertifikalar
              </li>
              <li>
                <strong>Mesleki Deneyim:</strong> CV içeriği, yetenekler, projeler
              </li>
              <li>
                <strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, çerez kayıtları, log kayıtları
              </li>
              <li>
                <strong>Görsel ve İşitsel Kayıtlar:</strong> Profil fotoğrafı (isteğe bağlı)
              </li>
            </ul>
          </section>

            <section id="isleme-amaclari" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">3. Kişisel Verilerin İşlenme Amaçları</h2>
            <p className="text-muted-foreground mb-3">Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Platformda üyelik ve kullanıcı hesabı oluşturulması</li>
              <li>İş ilanları ile geliştiricilerin eşleştirilmesi hizmetinin sunulması</li>
              <li>CV analizi ve yetenek değerlendirmesi yapılması</li>
              <li>Şirketler ile iş arayanların buluşturulması</li>
              <li>Platform hizmetlerinin geliştirilmesi ve iyileştirilmesi</li>
              <li>Kullanıcı destek hizmetlerinin sağlanması</li>
              <li>İstatistiksel analiz ve raporlama</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Platform güvenliğinin sağlanması</li>
            </ul>
          </section>

            <section id="aktarim" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">4. Kişisel Verilerin Aktarılması</h2>
            <p className="text-muted-foreground mb-3">
              Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>İş başvurusu yaptığınız veya eşleştiğiniz şirketlerle (açık rızanız ile)</li>
              <li>Hizmet sağlayıcılarımız ile (veri işleme, bulut hizmetleri, analitik)</li>
              <li>Yasal yükümlülükler çerçevesinde yetkili kamu kurum ve kuruluşlarıyla</li>
            </ul>
            <p className="text-muted-foreground mt-3">paylaşılabilmektedir.</p>
          </section>

            <section id="toplama-yontemi" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">5. Kişisel Verilerin Toplanma Yöntemi</h2>
            <p className="text-muted-foreground">
              Kişisel verileriniz, platform üzerinden kayıt formları, CV yükleme, profil güncelleme ve iletişim formları
              aracılığıyla otomatik veya otomatik olmayan yöntemlerle toplanmaktadır.
            </p>
          </section>

            <section id="saklama-suresi" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">6. Kişisel Verilerin Saklanma Süresi</h2>
            <p className="text-muted-foreground">
              Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca veya ilgili mevzuatta öngörülen süreler
              boyunca saklanmaktadır. Bu süre sona erdiğinde verileriniz silinir, yok edilir veya anonim hale getirilir.
            </p>
          </section>

            <section id="haklar" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">7. KVKK Kapsamındaki Haklarınız</h2>
            <p className="text-muted-foreground mb-3">KVKK'nın 11. maddesi uyarınca, şu haklara sahipsiniz:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
              <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
              <li>
                Yapılan düzeltme, silme ve yok etme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere
                bildirilmesini isteme
              </li>
              <li>
                İşlenen verilerin münhasıran otomatik sistemler ile analiz edilmesi nedeniyle aleyhinize bir sonucun
                ortaya çıkmasına itiraz etme
              </li>
              <li>
                Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme
              </li>
            </ul>
          </section>

            <section id="basvuru" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">8. Başvuru Yöntemi</h2>
            <p className="text-muted-foreground">
              Yukarıda belirtilen haklarınızı kullanmak için kimliğinizi tespit edici bilgiler ile talebinizi içeren
              başvurunuzu{" "}
              <a href="/iletisim" className="text-primary hover:underline">
                iletişim sayfamızdan
              </a>{" "}
              veya {CONTACT.email} adresine e-posta ile iletebilirsiniz.
            </p>
            <p className="text-muted-foreground mt-3">
              Başvurularınız, talebin niteliğine göre en kısa sürede ve en geç 30 (otuz) gün içinde ücretsiz olarak
              sonuçlandırılacaktır. İşlemin ayrıca bir maliyeti gerektirmesi halinde, Kişisel Verileri Koruma Kurulu
              tarafından belirlenen tarifedeki ücret alınabilir.
            </p>
          </section>

            <section id="iletisim" className="scroll-mt-24">
              <h2 className="text-2xl font-bold mb-4">9. İletişim</h2>
            <p className="text-muted-foreground">
              KVKK hakkında detaylı bilgi ve sorularınız için bizimle iletişime geçebilirsiniz:
            </p>
            <div className="bg-muted/50 p-4 rounded-lg mt-3">
              <p className="text-muted-foreground">
                <strong>E-posta:</strong> {CONTACT.kvkkEmail}
              </p>
              <p className="text-muted-foreground">
                <strong>Adres:</strong> {CONTACT.address}
              </p>
            </div>
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
                <Link href="/kullanim-sartlari" className="block hover:text-foreground transition-colors">
                  Kullanım Şartları
                </Link>
                <Link href="/gizlilik-politikasi" className="block hover:text-foreground transition-colors">
                  Gizlilik Politikası
                </Link>
                <Link href="/cerez-ayarlari" className="block hover:text-foreground transition-colors">
                  Çerez Ayarları
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>İletişim</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground/70">KVKK E-Posta</div>
                  <div className="text-foreground">{CONTACT.kvkkEmail}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground/70">Adres</div>
                  <div className="text-foreground">{CONTACT.address}</div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
