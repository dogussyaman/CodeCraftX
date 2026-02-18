import type { Metadata } from "next"
import Link from "next/link"
import { Calendar, MapPin, Video } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Glow from "@/components/ui/glow"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Etkinlikler"),
  description: "Yaklaşan yazılım ve teknoloji etkinlikleri. Konferans, workshop ve meetup'lar.",
  path: "/etkinlikler",
})

const TYPE_LABELS: Record<string, string> = {
  hackathon: "Hackathon",
  seminer: "Seminer",
  workshop: "Workshop",
  konferans: "Konferans",
  webinar: "Webinar",
}

export default async function EtkinliklerPage() {
  const supabase = await createClient()
  const now = new Date().toISOString()
  const { data: events } = await supabase
    .from("platform_events")
    .select("id, title, slug, type, short_description, start_date, end_date, is_online, location, cover_image_url, tags, featured, attendance_type, price")
    .eq("status", "published")
    .gte("start_date", now)
    .order("start_date", { ascending: true })

  const { data: pastEvents } = await supabase
    .from("platform_events")
    .select("id, title, slug, type, short_description, start_date, cover_image_url, attendance_type, price")
    .eq("status", "published")
    .lt("start_date", now)
    .order("start_date", { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden pb-20 pt-32">
        <div className="absolute bottom-10 left-10 size-96 rounded-full bg-accent-400/15 blur-[120px]" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-balance text-5xl font-bold md:text-6xl">
              Yaklaşan <span className="gradient-text">Etkinlikler</span>
            </h1>
            <p className="mb-8 text-pretty text-xl text-muted-foreground">
              Sektörün önde gelen etkinliklerine katılın, networking yapın ve kendinizi geliştirin.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {!events?.length ? (
            <Card className="border-dashed border-accent-500/30 bg-white/70 dark:bg-zinc-900/60">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="mb-4 size-16 text-muted-foreground/60" />
                <h2 className="mb-2 text-xl font-semibold">Şu an listelenecek etkinlik yok</h2>
                <p className="mb-6 text-muted-foreground">Yakında konferans, workshop ve meetup duyurularını burada görebileceksiniz.</p>
                <Button asChild variant="outline" className="border-accent-500/30">
                  <Link href="/iletisim">Etkinlik Öner</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((ev) => {
                const start = ev.start_date ? new Date(ev.start_date) : null
                const loc = ev.location as { city?: string; venue?: string } | null | undefined
                const locationLabel = ev.is_online ? "Online" : loc?.city ?? loc?.venue ?? "Yer bilgisi yok"
                return (
                  <Link key={ev.id} href={`/etkinlikler/${ev.slug}`} className="block h-full">
                    <Card className="relative h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md dark:hover:bg-muted/5 dark:hover:border-muted-foreground/10">
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                        <Glow variant="bottom" className="opacity-60" />
                      </div>
                      <div className="relative pt-3 px-3">
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                          {(ev as { cover_image_url?: string | null }).cover_image_url ? (
                            <img
                              src={(ev as { cover_image_url: string }).cover_image_url}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="size-full flex items-center justify-center text-muted-foreground/50">
                              <Calendar className="size-12" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 z-10 flex gap-1.5">
                            <Badge variant="secondary" className="text-xs">{TYPE_LABELS[ev.type] ?? ev.type}</Badge>
                            {(ev as { featured?: boolean }).featured && (
                              <Badge variant="default" className="text-xs">Öne çıkan</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <CardContent className="relative p-4 pt-3 space-y-2">
                        <h3 className="font-semibold text-foreground line-clamp-2 leading-snug">{ev.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs font-normal">
                            {(ev as { attendance_type?: string }).attendance_type === "free" ? "Ücretsiz" : `Ücretli · ${(ev as { price?: number }).price ?? 0} TL`}
                          </Badge>
                        </div>
                        {ev.short_description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{ev.short_description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {ev.is_online ? (
                            <Video className="size-3.5 shrink-0" />
                          ) : (
                            <MapPin className="size-3.5 shrink-0" />
                          )}
                          <span>{locationLabel}</span>
                        </div>
                        {start && (
                          <p className="text-xs text-muted-foreground">
                            {start.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "short" })} · {start.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                        {(ev as { tags?: string[] }).tags?.length ? (
                          <div className="flex flex-wrap gap-1.5">
                            {(ev as { tags: string[] }).tags.slice(0, 4).map((t) => (
                              <Badge key={t} variant="outline" className="text-xs font-normal">{t}</Badge>
                            ))}
                          </div>
                        ) : null}
                        <div className="pt-3">
                          <span className="inline-flex items-center justify-center rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                            Detaylar
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {pastEvents?.length ? (
        <section className="pb-20 border-t border-border">
          <div className="container mx-auto px-4 max-w-6xl pt-12">
            <h2 className="text-2xl font-bold mb-6">Geçmiş Etkinlikler</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((ev) => {
                const start = ev.start_date ? new Date(ev.start_date) : null
                return (
                  <Link key={ev.id} href={`/etkinlikler/${ev.slug}`} className="block">
                    <Card className="overflow-hidden rounded-xl border border-border bg-card/50 shadow-sm opacity-90 hover:opacity-100 transition-opacity hover:shadow">
                      <div className="flex gap-4 p-4">
                        <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                          {(ev as { cover_image_url?: string | null }).cover_image_url ? (
                            <img src={(ev as { cover_image_url: string }).cover_image_url} alt="" className="size-full object-cover" />
                          ) : (
                            <div className="size-full flex items-center justify-center">
                              <Calendar className="size-8 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-foreground line-clamp-1">{ev.title}</h3>
                          <p className="text-xs text-muted-foreground">{TYPE_LABELS[ev.type] ?? ev.type}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {(ev as { attendance_type?: string }).attendance_type === "free" ? "Ücretsiz" : `Ücretli · ${(ev as { price?: number }).price ?? 0} TL`}
                          </p>
                          {(ev as { short_description?: string }).short_description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{(ev as { short_description: string }).short_description}</p>
                          )}
                          {start && <p className="text-xs text-muted-foreground mt-0.5">{start.toLocaleDateString("tr-TR")}</p>}
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-muted/20 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-4xl font-bold">Etkinlik Düzenlemek İster misiniz?</h2>
            <p className="mb-8 text-xl text-muted-foreground">Kendi etkinliğinizi organize edin ve topluluğumuzu davet edin.</p>
            <Button size="lg" asChild className="bg-gradient-to-r from-accent-500 to-accent-400 text-white hover:from-accent-600 hover:to-accent-500">
              <Link href="/iletisim">Etkinlik Öner</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
