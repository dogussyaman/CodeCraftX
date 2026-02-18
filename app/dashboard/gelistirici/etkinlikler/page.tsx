import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Video, ExternalLink } from "lucide-react"

const TYPE_LABELS: Record<string, string> = {
  hackathon: "Hackathon",
  seminer: "Seminer",
  workshop: "Workshop",
  konferans: "Konferans",
  webinar: "Webinar",
}

export default async function GelistiriciEtkinliklerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: registrations } = await supabase
    .from("platform_event_registrations")
    .select(`
      event_id,
      registered_at,
      platform_events (
        id,
        title,
        slug,
        type,
        short_description,
        start_date,
        end_date,
        is_online,
        location,
        online_link,
        organizer_name,
        cover_image_url,
        status
      )
    `)
    .eq("user_id", user.id)

  const now = new Date().toISOString()
  type RegRow = (typeof registrations)[number]
  const upcoming: { reg: RegRow; start: Date }[] = []
  const past: { reg: RegRow; start: Date }[] = []

  for (const reg of registrations ?? []) {
    const ev = (reg as { platform_events: unknown }).platform_events
    if (!ev || typeof ev !== "object") continue
    const e = ev as { start_date?: string; status?: string }
    if (e.status !== "published") continue
    const startStr = e.start_date
    if (!startStr) continue
    const start = new Date(startStr)
    if (startStr >= now) upcoming.push({ reg, start })
    else past.push({ reg, start })
  }

  upcoming.sort((a, b) => a.start.getTime() - b.start.getTime())
  past.sort((a, b) => b.start.getTime() - a.start.getTime())

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Etkinliklerim</h1>
        <p className="text-muted-foreground text-sm mt-1">Kayıt olduğunuz etkinlikler. Takvimde de görünür.</p>
      </div>

      {upcoming.length === 0 && past.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="size-12 text-muted-foreground/50 mb-4" />
            <h2 className="font-semibold text-foreground mb-2">Henüz kayıt olduğunuz etkinlik yok</h2>
            <p className="text-sm text-muted-foreground mb-4">Yaklaşan etkinliklere kayıt olup burada ve takvimde görebilirsiniz.</p>
            <Button asChild>
              <Link href="/etkinlikler">Etkinliklere göz at</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Yaklaşan etkinlikler</h2>
              <ul className="space-y-4">
                {upcoming.map(({ reg, start }) => {
                  const ev = (reg as { platform_events: unknown }).platform_events as {
                    id: string
                    title?: string
                    slug?: string
                    type?: string
                    short_description?: string | null
                    end_date?: string | null
                    is_online?: boolean
                    location?: { city?: string; venue?: string } | null
                    online_link?: string | null
                    organizer_name?: string | null
                    cover_image_url?: string | null
                  }
                  const end = ev.end_date ? new Date(ev.end_date) : null
                  const locationLabel = ev.is_online ? "Online" : (ev.location?.city ?? ev.location?.venue ?? "")
                  return (
                    <li key={ev.id}>
                      <Card>
                        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                          {ev.cover_image_url ? (
                            <div className="w-full sm:w-32 h-24 sm:h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                              <img src={ev.cover_image_url} alt="" className="size-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-full sm:w-32 h-24 sm:h-24 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Calendar className="size-8 text-muted-foreground/50" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <Badge variant="secondary">{TYPE_LABELS[ev.type ?? ""] ?? ev.type}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {start.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "short" })}
                                {" · "}
                                {start.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                                {end && ` - ${end.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`}
                              </span>
                            </div>
                            <h3 className="font-semibold text-foreground">{ev.title}</h3>
                            {ev.short_description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{ev.short_description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                              {ev.is_online ? <Video className="size-3.5" /> : <MapPin className="size-3.5" />}
                              <span>{locationLabel}</span>
                              {ev.organizer_name && <span>· {ev.organizer_name}</span>}
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button variant="default" size="sm" asChild>
                                <Link href={`/etkinlikler/${ev.slug}`}>Detay</Link>
                              </Button>
                              {ev.is_online && ev.online_link && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={ev.online_link} target="_blank" rel="noopener noreferrer" className="gap-1">
                                    <ExternalLink className="size-3.5" />
                                    Katıl
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Geçmiş etkinlikler</h2>
              <ul className="space-y-3">
                {past.map(({ reg }) => {
                  const ev = (reg as { platform_events: unknown }).platform_events as {
                    id: string
                    title?: string
                    slug?: string
                    type?: string
                    start_date?: string
                  }
                  const start = ev.start_date ? new Date(ev.start_date) : null
                  return (
                    <li key={ev.id}>
                      <Card className="bg-muted/30">
                        <CardContent className="p-3 flex flex-row items-center justify-between gap-2">
                          <div>
                            <span className="font-medium text-foreground">{ev.title}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {TYPE_LABELS[ev.type ?? ""] ?? ev.type}
                              {start && ` · ${start.toLocaleDateString("tr-TR")}`}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/etkinlikler/${ev.slug}`}>Detay</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          <div className="pt-4">
            <Button variant="outline" asChild>
              <Link href="/etkinlikler">Tüm etkinlikler</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
