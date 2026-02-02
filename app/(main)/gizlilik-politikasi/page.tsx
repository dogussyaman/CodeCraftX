import type { Metadata } from "next"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Gizlilik Politikası"),
  description: "Codecrafters gizlilik politikası. Kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu.",
  path: "/gizlilik-politikasi",
})

export default function GizlilikPolitikasiPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-32 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 gradient-text">Gizlilik Politikası</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Giriş</h2>
            <p className="text-muted-foreground">
              Codecrafters olarak, kullanıcılarımızın gizliliğini korumayı öncelikli hedeflerimizden biri olarak
              görüyoruz. Bu gizlilik politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu
              açıklamaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Toplanan Bilgiler</h2>
            <p className="text-muted-foreground mb-3">Platformumuzda aşağıdaki bilgiler toplanmaktadır:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Ad, soyad ve e-posta adresi gibi kimlik bilgileri</li>
              <li>CV ve özgeçmiş bilgileri</li>
              <li>Eğitim ve iş deneyimi bilgileri</li>
              <li>Teknik yetenek ve beceri bilgileri</li>
              <li>Platform kullanım verileri ve log kayıtları</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Bilgilerin Kullanımı</h2>
            <p className="text-muted-foreground mb-3">Toplanan bilgiler şu amaçlarla kullanılmaktadır:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Kullanıcı hesaplarının oluşturulması ve yönetilmesi</li>
              <li>İş ilanları ile geliştiricilerin eşleştirilmesi</li>
              <li>Platform hizmetlerinin sağlanması ve iyileştirilmesi</li>
              <li>Kullanıcı destek hizmetlerinin sunulması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Veri Güvenliği</h2>
            <p className="text-muted-foreground">
              Kişisel verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri kullanmaktayız.
              Verileriniz şifrelenmiş bağlantılar üzerinden iletilir ve güvenli sunucularda saklanır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Üçüncü Taraf Paylaşımı</h2>
            <p className="text-muted-foreground">
              Kişisel bilgileriniz, açık izniniz olmadan üçüncü taraflarla paylaşılmaz. Sadece iş başvurusu yaptığınız
              veya eşleştiğiniz şirketlerle, sizin onayınızla bilgileriniz paylaşılır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Çerezler (Cookies)</h2>
            <p className="text-muted-foreground">
              Platformumuz, kullanıcı deneyimini iyileştirmek ve analiz yapmak amacıyla çerezler kullanmaktadır. Çerez
              tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Kullanıcı Hakları</h2>
            <p className="text-muted-foreground mb-3">Kullanıcılarımız aşağıdaki haklara sahiptir:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Kişisel verilerine erişim hakkı</li>
              <li>Yanlış verilerin düzeltilmesini talep etme hakkı</li>
              <li>Verilerin silinmesini isteme hakkı</li>
              <li>Veri işlemeye itiraz etme hakkı</li>
              <li>Verilerin taşınabilirliği hakkı</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Değişiklikler</h2>
            <p className="text-muted-foreground">
              Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler olması durumunda kullanıcılarımız
              e-posta yoluyla bilgilendirilecektir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. İletişim</h2>
            <p className="text-muted-foreground">
              Gizlilik politikamız hakkında sorularınız için{" "}
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
