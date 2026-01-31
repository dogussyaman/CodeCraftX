import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

export function ContactFaqAccordion() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sık Sorulan Sorular</CardTitle>
        <CardDescription>Hızlı cevaplar için SSS bölümümüze göz atın</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-1">
          <AccordionItem value="item-1" className="border rounded-lg px-3">
            <AccordionTrigger className="text-left text-sm hover:no-underline py-4">
              <span className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-normal">Genel</Badge>
                <Badge variant="outline" className="text-xs font-normal">Popüler</Badge>
                Platform tamamen ücretsiz mi?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pb-3">
              Evet, geliştiriciler için tüm temel özellikler ücretsizdir. CV analizi, iş eşleştirme ve başvuru
              yapma gibi tüm özellikleri ücretsiz kullanabilirsiniz.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border rounded-lg px-3">
            <AccordionTrigger className="text-left text-sm hover:no-underline py-4">
              <span className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-normal">Genel</Badge>
                Eşleşme süreci ne kadar sürer?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pb-3">
              CV analizi anında tamamlanır. Yapay zeka algoritmamız profilinizi oluşturur oluşturmaz, size uygun
              iş ilanlarını göstermeye başlar.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border rounded-lg px-3">
            <AccordionTrigger className="text-left text-sm hover:no-underline py-4">
              <span className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-normal">Şirket</Badge>
                Şirket olarak nasıl kayıt olabilirim?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pb-3">
              Kayıt sayfasından üye olun, admin tarafından İK rolü verilmesini bekleyin. Alternatif olarak
              satış ekibimizle iletişime geçerek kurumsal paket bilgisi alabilirsiniz.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4" className="border rounded-lg px-3">
            <AccordionTrigger className="text-left text-sm hover:no-underline py-4">
              <span className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-normal">Güvenlik</Badge>
                <Badge variant="outline" className="text-xs font-normal">Popüler</Badge>
                Verilerim güvende mi?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pb-3">
              Kesinlikle! Tüm verileriniz şifrelenmiş olarak saklanır ve KVKK&apos;ya tam uyumluyuz. Verileriniz asla
              üçüncü şahıslarla paylaşılmaz.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5" className="border rounded-lg px-3">
            <AccordionTrigger className="text-left text-sm hover:no-underline py-4">
              <span className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-normal">Destek</Badge>
                Destek saatleriniz nedir?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pb-3">
              E-posta desteğimiz 7/24 aktiftir. hello@codecrafters.xyz ve support@codecrafters.xyz adreslerinden bize ulaşabilirsiniz.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6" className="border rounded-lg px-3">
            <AccordionTrigger className="text-left text-sm hover:no-underline py-4">
              <span className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-normal">Teknik</Badge>
                Hangi dosya formatlarını destekliyorsunuz?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pb-3">
              CV için PDF, DOCX, DOC ve TXT desteklenir. Maksimum 5MB. Profil fotoğrafı için JPG, PNG ve WebP (max 2MB).
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-7" className="border rounded-lg px-3">
            <AccordionTrigger className="text-left text-sm hover:no-underline py-4">
              <span className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-normal">Hesap</Badge>
                Hesabımı nasıl silebilirim?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pb-3">
              Hesap ayarlarından &quot;Hesabı Sil&quot; seçeneğini kullanabilirsiniz. İşlem geri alınamaz; önce verilerinizi dışa aktarabilirsiniz.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-8" className="border rounded-lg px-3">
            <AccordionTrigger className="text-left text-sm hover:no-underline py-4">
              <span className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-normal">Faturalandırma</Badge>
                Ücretli paketler nelerdir?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pb-3">
              Geliştiriciler için platform ücretsizdir. Şirketler için Başlangıç, Profesyonel ve Kurumsal paketler mevcuttur. Detay için iletişime geçin.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
