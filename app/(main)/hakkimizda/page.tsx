import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Hakkımızda | CodeCraftX",
  description: "CodeCraftX - Geliştiricileri ve şirketleri yapay zeka destekli eşleştirme ile buluşturan kariyer platformu.",
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Code2,
  Users,
  Target,
  Rocket,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Heart,
  Award,
  Lightbulb,
  Calendar,
} from "lucide-react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-20 right-10 size-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-10 size-96 bg-secondary/10 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              <span className="gradient-text">CodeCraftX</span> Hakkında
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Türkiye'nin en yenilikçi yazılımcı-şirket eşleştirme platformu
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
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
                Hızlı Büyüyen
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Target className="size-4" />
                Misyonumuz
              </div>
              <h2 className="text-4xl font-bold mb-6">Doğru Yetenekle Doğru Fırsatı Buluşturuyoruz</h2>
              <p className="text-muted-foreground text-lg mb-4">
                CodeCraftX, yetenekli yazılım geliştiricilerini hayallerindeki işlerle buluşturan, yapay zeka destekli
                uçtan uca bir İK ekosistemidir.
              </p>
              <p className="text-muted-foreground text-lg mb-4">
                Gelişmiş CV analiz teknolojimiz ve akıllı eşleştirme algoritmalarımız ile işe alım süreçlerindeki manuel yükü %90 oranında azaltıyoruz. Şirketler için aday havuzu kalitesini artırırken, geliştiriciler için kişiselleştirilmiş kariyer yolculukları sunuyoruz.
              </p>
              <p className="text-muted-foreground text-lg">
                Vizyonumuz, yazılım dünyasında "doğru insan, doğru iş" prensibini yapay zekanın objektifliği ve hızıyla birleştirerek Türkiye'nin dijital dönüşümüne katkı sağlamaktır.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-8 backdrop-blur-sm border border-border/50">
                <div className="h-full flex flex-col justify-center gap-6">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 backdrop-blur-sm">
                    <Code2 className="size-8 text-primary shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Akıllı Eşleştirme</h3>
                      <p className="text-sm text-muted-foreground">Yapay zeka destekli algoritma</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 backdrop-blur-sm">
                    <Users className="size-8 text-secondary shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Topluluk Odaklı</h3>
                      <p className="text-sm text-muted-foreground">Güçlü geliştirici ağı</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 backdrop-blur-sm">
                    <Rocket className="size-8 text-accent shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Hızlı Süreç</h3>
                      <p className="text-sm text-muted-foreground">Anında sonuç alma</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* Why Choose Us - Accordion */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Neden Bizi Seçmelisiniz?</h2>
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-4">
                <div className="p-1 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                  <div className="bg-background rounded-lg p-6 space-y-4">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                      <Lightbulb className="text-primary size-6" />
                      Kilometre Taşlarımız
                    </h3>
                    <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
                      {[
                        { year: "2024", title: "Kuruluş", desc: "CodeCraftX fikir olarak doğdu ve ilk tohumlar atıldı." },
                        { year: "2025", title: "Beta Lansmanı", desc: "1000'den fazla geliştirici ile beta sürecine başladık." },
                        { year: "2026", title: "Yapay Zeka V2", desc: "Yeni nesil eşleştirme algoritmasını yayına aldık." }
                      ].map((item, i) => (
                        <div key={i} className="pl-8 relative">
                          <div className="absolute left-0 top-1.5 size-4 rounded-full bg-primary border-4 border-background" />
                          <div className="text-sm font-bold text-primary">{item.year}</div>
                          <div className="font-semibold text-foreground">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Yapay Zeka Destekli Eşleştirme</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="mb-3">
                      Gelişmiş makine öğrenimi algoritmaları ile CV'nizdeki becerileri, deneyimleri ve tercihleri analiz
                      ederek size en uygun iş fırsatlarını buluyoruz.
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>50+ teknoloji ve framework tanıma</li>
                      <li>Deneyim seviyesi otomatik tespiti</li>
                      <li>Kültürel uyum analizi</li>
                      <li>Maaş beklentisi optimizasyonu</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Güvenlik ve Gizlilik</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="mb-3">
                      Verilerinizin güvenliği bizim için önceliktir. Tüm bilgileriniz şifrelenmiş olarak saklanır ve KVKK'ya
                      tam uyumluyuz.
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>256-bit SSL şifreleme</li>
                      <li>KVKK ve GDPR uyumlu</li>
                      <li>İki faktörlü kimlik doğrulama</li>
                      <li>Düzenli güvenlik denetimleri</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Kariyer Gelişimi</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="mb-3">
                      Sadece iş bulmakla kalmayın, kariyerinizi bir sonraki seviyeye taşıyın. Eğitimler, mentorluk ve
                      topluluk etkinlikleri ile sürekli gelişin.
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Ücretsiz online eğitimler</li>
                      <li>Deneyimli mentorlarla eşleşme</li>
                      <li>Hackathon ve etkinlikler</li>
                      <li>Beceri değerlendirme testleri</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Güçlü Topluluk</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="mb-3">
                      10.000+ geliştiriciden oluşan topluluğumuzda bilgi paylaşın, networking yapın ve birlikte büyüyün.
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Aktif forum ve tartışma grupları</li>
                      <li>Haftalık teknik webinarlar</li>
                      <li>Açık kaynak proje işbirlikleri</li>
                      <li>Yerel meetup organizasyonları</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* Values & Team - Tabs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="values" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="values">Değerlerimiz</TabsTrigger>
                <TabsTrigger value="team">Ekibimiz</TabsTrigger>
              </TabsList>

              <TabsContent value="values">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Heart className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>İnsan Odaklılık</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Her geliştiricinin benzersiz bir hikayesi vardır. Onları sadece bir CV olarak değil, potansiyelleri
                        ile değerlendiririz.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Lightbulb className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>İnovasyon</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Sürekli gelişen teknoloji ile işe alım süreçlerini yeniden tanımlıyor, sektöre öncülük ediyoruz.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>Şeffaflık</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Tüm süreçlerimizde açık ve dürüstüz. Gizli ücretler, gizli anlaşmalar yok. Her şey net ve anlaşılır.
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>Mükemmellik</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Kaliteden ödün vermiyoruz. Hem geliştiricilere hem de şirketlere en iyi deneyimi sunmak için
                        çalışıyoruz.
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="team">
                <div className="space-y-6">
                  <p className="text-center text-muted-foreground mb-8">
                    CodeCraftX, deneyimli yazılım mühendisleri, veri bilimcileri ve HR uzmanlarından oluşan tutkulu bir
                    ekip tarafından yönetilmektedir.
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      {
                        role: "Mühendislik",
                        icon: Code2,
                        color: "primary",
                        gradient: "from-primary/20 to-secondary/20",
                        desc: "15+ yıl deneyimli yazılım mimarları ve full-stack geliştiriciler",
                        lead: "Kaan Yılmaz",
                        leadTitle: "CTO",
                        stats: "20+ Proje",
                        avatar: "KY"
                      },
                      {
                        role: "Veri Bilimi",
                        icon: Zap,
                        color: "secondary",
                        gradient: "from-secondary/20 to-accent/20",
                        desc: "AI/ML uzmanları ve veri analistleri ile güçlü algoritmalar",
                        lead: "Deniz Kaya",
                        leadTitle: "Head of AI",
                        stats: "5M+ Veri İşleme",
                        avatar: "DK"
                      },
                      {
                        role: "İnsan Kaynakları",
                        icon: Users,
                        color: "accent",
                        gradient: "from-accent/20 to-primary/20",
                        desc: "Sektör deneyimli HR profesyonelleri ve kariyer danışmanları",
                        lead: "Selim Aktaş",
                        leadTitle: "HR Director",
                        stats: "10K+ Mülakat",
                        avatar: "SA"
                      }
                    ].map((team, idx) => (
                      <HoverCard key={idx}>
                        <HoverCardTrigger asChild>
                          <Card className="text-center cursor-help transition-all hover:border-primary/50">
                            <CardHeader>
                              <div className={`mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br ${team.gradient} flex items-center justify-center`}>
                                <team.icon className={`h-10 w-10 text-${team.color}`} />
                              </div>
                              <CardTitle className="text-lg">{team.role}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <CardDescription>{team.desc}</CardDescription>
                            </CardContent>
                          </Card>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="flex justify-between space-x-4">
                            <Avatar>
                              <AvatarFallback className="bg-primary/10 text-primary">{team.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">{team.lead}</h4>
                              <p className="text-sm text-muted-foreground">
                                {team.leadTitle} — Ekip Lideri
                              </p>
                              <div className="flex items-center pt-2">
                                <Calendar className="mr-2 h-4 w-4 opacity-70" />{" "}
                                <span className="text-xs text-muted-foreground">
                                  {team.stats} tamamlandı
                                </span>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { value: "10K+", label: "Aktif Geliştirici" },
              { value: "500+", label: "Şirket Ortağımız" },
              { value: "15K+", label: "Başarılı Eşleşme" },
              { value: "95%", label: "Memnuniyet Oranı" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Hemen Başlayın</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Kariyerinizde bir sonraki adımı atmak için topluluğumuza katılın
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="group">
                <Link href="/auth/kayit">
                  Ücretsiz Kaydol
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/iletisim">Bize Ulaşın</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
