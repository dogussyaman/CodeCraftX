import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { COMMUNITY_DISCORD_URL } from "@/lib/constants"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users, Calendar, TrendingUp } from "lucide-react"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Topluluk"),
  description: "Codecrafters topluluğu. Binlerce yazılımcıyla bilgi paylaşın ve birlikte öğrenin.",
  path: "/topluluk",
})

export default function ToplulukPage() {
  const forumlar = [
    {
      id: 1,
      baslik: "React Best Practices 2024",
      kategori: "Frontend",
      yazar: "Ahmet Yılmaz",
      mesajlar: 45,
      goruntuleme: 1250,
      tarih: "2 saat önce",
    },
    {
      id: 2,
      baslik: "Microservices vs Monolith Tartışması",
      kategori: "Backend",
      yazar: "Zeynep Kaya",
      mesajlar: 89,
      goruntuleme: 3400,
      tarih: "5 saat önce",
    },
    {
      id: 3,
      baslik: "Junior Developer Yol Haritası",
      kategori: "Kariyer",
      yazar: "Mehmet Demir",
      mesajlar: 156,
      goruntuleme: 8900,
      tarih: "1 gün önce",
    },
    {
      id: 4,
      baslik: "TypeScript Generic Types Nasıl Kullanılır?",
      kategori: "Language",
      yazar: "Ayşe Şahin",
      mesajlar: 34,
      goruntuleme: 890,
      tarih: "3 saat önce",
    },
  ]

  const istatistikler = [
    { label: "Toplam Üye", deger: "12,450", icon: Users },
    { label: "Aktif Konu", deger: "3,250", icon: MessageSquare },
    { label: "Aylık Etkinlik", deger: "48", icon: Calendar },
    { label: "Haftalık Büyüme", deger: "+15%", icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">

        <div className="absolute top-20 right-10 size-96 bg-accent/10 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              Codecrafters <span className="gradient-text">Topluluğu</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Binlerce yazılımcının bilgi paylaştığı, birlikte öğrendiği platform
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/kayit">Topluluğa Katıl</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {istatistikler.map((stat, idx) => (
              <Card key={idx} className="text-center">
                <CardContent className="pt-6">
                  <stat.icon className="size-8 mx-auto mb-3 text-primary" />
                  <div className="text-3xl font-bold gradient-text mb-1">{stat.deger}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Forum Topics */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Popüler Konular</h2>
              <Button variant="outline" disabled aria-disabled="true" className="cursor-not-allowed opacity-70">
                Yakında
              </Button>
            </div>
            <div className="space-y-4">
              {forumlar.map((forum) => (
                <Card key={forum.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{forum.kategori}</Badge>
                          <span className="text-xs text-muted-foreground">{forum.tarih}</span>
                        </div>
                        <CardTitle className="hover:text-primary transition-colors cursor-pointer">
                          {forum.baslik}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="size-6">
                              <AvatarFallback className="text-xs">
                                {forum.yazar
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{forum.yazar}</span>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="size-4" />
                          <span>{forum.mesajlar}</span>
                        </div>
                        <div className="text-xs">{forum.goruntuleme.toLocaleString("tr-TR")} görüntülenme</div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Sohbete Katılın</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Discord sunucumuzda anlık olarak binlerce geliştiriciye ulaşın
            </p>
            {COMMUNITY_DISCORD_URL ? (
              <Button size="lg" asChild>
                <a href={COMMUNITY_DISCORD_URL} target="_blank" rel="noopener noreferrer">
                  Discord&apos;a Katıl
                </a>
              </Button>
            ) : (
              <Button size="lg" variant="outline" disabled className="cursor-not-allowed opacity-70">
                Discord&apos;a Katıl (Yakında)
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
