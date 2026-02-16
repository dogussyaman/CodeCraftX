import type { Metadata } from "next"
import Link from "next/link"
import { Calendar, MessageSquare, TrendingUp, Users } from "lucide-react"

import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { COMMUNITY_DISCORD_URL } from "@/lib/constants"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Topluluk"),
  description: "CodeCraftX topluluğu. Binlerce yazılımcıyla bilgi paylaşın ve birlikte öğrenin.",
  path: "/topluluk",
})

export default function ToplulukPage() {
  const forumlar = [
    { id: 1, baslik: "React Best Practices 2026", kategori: "Frontend", yazar: "Ahmet Yılmaz", mesajlar: 45, goruntuleme: 1250, tarih: "2 saat önce" },
    { id: 2, baslik: "Microservices vs Monolith Tartışması", kategori: "Backend", yazar: "Zeynep Kaya", mesajlar: 89, goruntuleme: 3400, tarih: "5 saat önce" },
    { id: 3, baslik: "Junior Developer Yol Haritası", kategori: "Kariyer", yazar: "Mehmet Demir", mesajlar: 156, goruntuleme: 8900, tarih: "1 gün önce" },
    { id: 4, baslik: "TypeScript Generic Types Nasıl Kullanılır?", kategori: "Language", yazar: "Ayşe Şahin", mesajlar: 34, goruntuleme: 890, tarih: "3 saat önce" },
  ]

  const istatistikler = [
    { label: "Toplam Üye", deger: "12.450", icon: Users },
    { label: "Aktif Konu", deger: "3.250", icon: MessageSquare },
    { label: "Aylık Etkinlik", deger: "48", icon: Calendar },
    { label: "Haftalık Büyüme", deger: "+15%", icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden pb-20 pt-32">
        <div className="absolute right-10 top-20 size-96 rounded-full bg-accent-400/15 blur-[120px]" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-balance text-5xl font-bold md:text-6xl">
              CodeCraftX <span className="gradient-text">Topluluğu</span>
            </h1>
            <p className="mb-8 text-pretty text-xl text-muted-foreground">
              Binlerce yazılımcının bilgi paylaştığı, birlikte öğrendiği platform.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-accent-500 to-accent-400 text-white hover:from-accent-600 hover:to-accent-500">
              <Link href="/auth/kayit">Topluluğa Katıl</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-4">
            {istatistikler.map((stat) => (
              <Card key={stat.label} className="border-accent-500/20 bg-white/75 text-center dark:bg-zinc-900/60">
                <CardContent className="pt-6">
                  <stat.icon className="mx-auto mb-3 size-8 text-primary" />
                  <div className="gradient-text mb-1 text-3xl font-bold">{stat.deger}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold">Popüler Konular</h2>
              <Button variant="outline" disabled className="cursor-not-allowed opacity-70">
                Yakında
              </Button>
            </div>

            <div className="space-y-4">
              {forumlar.map((forum) => (
                <Card key={forum.id} className="border-accent-500/20 bg-white/75 transition-shadow hover:shadow-lg dark:bg-zinc-900/60">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="secondary">{forum.kategori}</Badge>
                          <span className="text-xs text-muted-foreground">{forum.tarih}</span>
                        </div>
                        <CardTitle className="cursor-pointer transition-colors hover:text-primary">{forum.baslik}</CardTitle>
                        <CardDescription className="mt-2 flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-xs">
                              {forum.yazar
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span>{forum.yazar}</span>
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

      <section className="bg-muted/20 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-4xl font-bold">Sohbete Katılın</h2>
            <p className="mb-8 text-xl text-muted-foreground">Discord sunucumuzda binlerce geliştiriciye anlık olarak ulaşın.</p>
            {COMMUNITY_DISCORD_URL ? (
              <Button size="lg" asChild className="bg-gradient-to-r from-accent-500 to-accent-400 text-white hover:from-accent-600 hover:to-accent-500">
                <a href={COMMUNITY_DISCORD_URL} target="_blank" rel="noopener noreferrer">
                  Discord'a Katıl
                </a>
              </Button>
            ) : (
              <Button size="lg" variant="outline" disabled className="cursor-not-allowed opacity-70">
                Discord'a Katıl (Yakında)
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
