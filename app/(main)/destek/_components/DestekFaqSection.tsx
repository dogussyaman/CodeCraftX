"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, BookOpen, CreditCard, User, CheckCircle2 } from "lucide-react"

export function DestekFaqSection() {
  const [activeTab, setActiveTab] = useState("genel")

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Sık Sorulan Sorular</h2>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="genel" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                Genel
              </TabsTrigger>
              <TabsTrigger value="teknik" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Teknik
              </TabsTrigger>
              <TabsTrigger value="fatura" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Faturalandırma
              </TabsTrigger>
              <TabsTrigger value="hesap" className="gap-2">
                <User className="h-4 w-4" />
                Hesap
              </TabsTrigger>
            </TabsList>

            <TabsContent value="genel">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs font-normal">Genel</Badge>
                      <Badge variant="outline" className="text-xs font-normal">Popüler</Badge>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      CodeCrafters nedir ve nasıl çalışır?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    CodeCrafters, yazılım geliştiricileri ve şirketleri yapay zeka destekli eşleştirme algoritması
                    ile buluşturan bir platformdur. CV&apos;nizi yükleyin, sistemimiz becerilerinizi analiz eder ve size
                    en uygun iş fırsatlarını önerir.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs font-normal">Genel</Badge>
                      Platform tamamen ücretsiz mi?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Evet! Yazılım geliştiriciler için tüm temel özellikler tamamen ücretsizdir. CV analizi, iş
                    eşleştirme, profil oluşturma ve başvuru yapma gibi tüm özellikleri ücretsiz kullanabilirsiniz.
                    Şirketler için farklı paketlerimiz mevcuttur.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs font-normal">Teknik</Badge>
                      Hangi programlama dillerini destekliyorsunuz?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Platformumuz JavaScript, Python, Java, C#, Go, Rust, PHP, Ruby ve daha birçok popüler
                    programlama dilini desteklemektedir. CV analiz sistemimiz 50&apos;den fazla teknoloji ve framework&apos;ü
                    tanıyabilir.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs font-normal">Genel</Badge>
                      Eşleşme süreci ne kadar sürer?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    CV analizi anında tamamlanır. Yapay zeka algoritmamız profilinizi oluşturur oluşturmaz, size
                    uygun iş ilanlarını göstermeye başlar. Yeni ilanlar eklendiğinde de otomatik olarak
                    bilgilendirilirsiniz.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs font-normal">Güvenlik</Badge>
                      <Badge variant="outline" className="text-xs font-normal">Popüler</Badge>
                      Verilerim güvende mi?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Kesinlikle! Tüm verileriniz şifrelenmiş olarak saklanır ve KVKK&apos;ya tam uyumluyuz. Verileriniz
                    asla üçüncü şahıslarla paylaşılmaz. Gizlilik politikamızı inceleyerek detaylı bilgi
                    alabilirsiniz.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs font-normal">Şirket</Badge>
                      Şirketler için İK paneli neler sunuyor?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    İK panelimiz; otomatik aday puanlama, mülakat takvimi yönetimi, ekip içi aday değerlendirme notları ve detaylı işe alım analitiği gibi kurumsal ihtiyaçlara yönelik gelişmiş özellikler sunar.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-7">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs font-normal">Şirket</Badge>
                      Headhunter veya Danışmanlık firmaları kullanabilir mi?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Evet, &quot;Kurumsal&quot; paketimiz ile danışmanlık firmaları birden fazla müşteri hesabı yönetebilir, adayları farklı projeler için kategorize edebilir ve profesyonel raporlar oluşturabilir.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="teknik">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tech-1">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs font-normal">Teknik</Badge>
                      CV yüklerken hangi formatları destekliyorsunuz?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    PDF, DOCX, DOC ve TXT formatlarını destekliyoruz. En iyi sonuçlar için PDF formatını
                    öneriyoruz. Maksimum dosya boyutu 5MB&apos;dır.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tech-2">
                  <AccordionTrigger className="text-left">Profil fotoğrafı yükleyemiyorum, ne yapmalıyım?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Fotoğrafınızın JPG, PNG veya WebP formatında ve 2MB&apos;dan küçük olduğundan emin olun. Sorun
                    devam ederse, tarayıcınızın önbelleğini temizleyin veya farklı bir tarayıcı deneyin. Hala
                    sorun yaşıyorsanız destek ekibimize ulaşın.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tech-3">
                  <AccordionTrigger className="text-left">Mobil uygulama var mı?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Şu anda web platformumuz tüm cihazlarda responsive olarak çalışmaktadır. iOS ve Android
                    uygulamalarımız 2026 Q2&apos;de yayınlanacaktır. Duyurulardan haberdar olmak için bültenimize
                    abone olabilirsiniz.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tech-4">
                  <AccordionTrigger className="text-left">API entegrasyonu sunuyor musunuz?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Evet, kurumsal paketlerimizde RESTful API erişimi sunuyoruz. API dokümantasyonumuz için
                    developers.codecrafters.com adresini ziyaret edebilir veya satış ekibimizle iletişime
                    geçebilirsiniz.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="fatura">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="bill-1">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs font-normal">Faturalandırma</Badge>
                      Ücretli paketler nelerdir?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Geliştiriciler için platform tamamen ücretsizdir. Şirketler için Başlangıç (₺999/ay), Profesyonel
                    (₺2.999/ay) ve Kurumsal (özel fiyatlandırma) paketlerimiz bulunmaktadır. Detaylar için
                    fiyatlandırma sayfamızı ziyaret edin.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="bill-2">
                  <AccordionTrigger className="text-left">Hangi ödeme yöntemlerini kabul ediyorsunuz?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Kredi kartı, banka kartı ve havale/EFT ile ödeme alıyoruz. Kurumsal müşterilerimiz için fatura
                    ile ödeme seçeneği de mevcuttur. Tüm ödemeler SSL ile şifrelenir.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="bill-3">
                  <AccordionTrigger className="text-left">İptal ve iade politikanız nedir?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Aboneliğinizi istediğiniz zaman iptal edebilirsiniz. İptal sonrası mevcut dönem sonuna kadar
                    hizmetlerimizi kullanmaya devam edebilirsiniz. İlk 14 gün içinde memnun kalmazsanız tam iade
                    garantisi sunuyoruz.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="bill-4">
                  <AccordionTrigger className="text-left">Fatura nasıl alabilirim?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Her ödeme sonrası otomatik olarak e-fatura gönderilir. Geçmiş faturalarınıza hesap
                    ayarlarınızdan &quot;Faturalandırma&quot; bölümünden ulaşabilirsiniz. Kurumsal fatura için şirket
                    bilgilerinizi profil ayarlarınızdan güncelleyin.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="hesap">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="acc-1">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs font-normal">Hesap</Badge>
                      Hesap nasıl oluşturabilirim?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Kayıt sayfasından e-posta adresiniz ile veya Google/GitHub hesabınız ile hızlıca kayıt
                    olabilirsiniz. Kayıt sonrası e-posta doğrulaması yapmanız gerekmektedir.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="acc-2">
                  <AccordionTrigger className="text-left">Şifremi unuttum, ne yapmalıyım?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Giriş sayfasındaki &quot;Şifremi Unuttum&quot; linkine tıklayın. E-posta adresinizi girin, size şifre
                    sıfırlama linki göndereceğiz. Link 1 saat geçerlidir.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="acc-3">
                  <AccordionTrigger className="text-left">Hesabımı nasıl silebilirim?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Hesap ayarlarından &quot;Hesabı Sil&quot; seçeneğini kullanabilirsiniz. Bu işlem geri alınamaz ve tüm
                    verileriniz kalıcı olarak silinir. Silme işlemi öncesi tüm verilerinizi dışa aktarabilirsiniz.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="acc-4">
                  <AccordionTrigger className="text-left">E-posta adresimi değiştirebilir miyim?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Evet, hesap ayarlarından e-posta adresinizi güncelleyebilirsiniz. Yeni e-posta adresinize
                    doğrulama linki gönderilecektir. Doğrulama sonrası değişiklik tamamlanır.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="acc-5">
                  <AccordionTrigger className="text-left">İki faktörlü kimlik doğrulama (2FA) nasıl aktif edilir?</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Hesap ayarlarından &quot;Güvenlik&quot; bölümüne gidin ve &quot;İki Faktörlü Kimlik Doğrulama&quot; seçeneğini
                    aktif edin. Google Authenticator veya benzeri bir uygulama ile QR kodu taratın. Hesabınızın
                    güvenliği için 2FA kullanmanızı şiddetle öneriyoruz.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
