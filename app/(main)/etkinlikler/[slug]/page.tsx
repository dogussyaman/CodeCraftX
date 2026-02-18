import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Calendar, MapPin, Video, ExternalLink, Mail, User } from "lucide-react"
import { EventRegisterButton } from "./_components/EventRegisterButton"

const TYPE_LABELS: Record<string, string> = {
  hackathon: "Hackathon",
  seminer: "Seminer",
  workshop: "Workshop",
  konferans: "Konferans",
  webinar: "Webinar",
}

type EventRow = {
  id: string
  title: string
  type: string
  short_description: string | null
  description: string | null
  cover_image_url: string | null
  tags: string[] | null
  start_date: string
  end_date: string | null
  timezone: string | null
  is_online: boolean
  location: { city?: string; address?: string; venue?: string; map_link?: string } | null
  online_link: string | null
  online_platform: string | null
  organizer_name: string | null
  organizer_website: string | null
  contact_email: string | null
  attendance_type: string
  price: number
  max_participants: number | null
  registration_required: boolean
  registration_deadline: string | null
  is_team_event: boolean
  min_team_size: number | null
  max_team_size: number | null
  theme_description: string | null
  technologies: string[] | null
  featured: boolean
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("platform_events").select("title, short_description").eq("slug", slug).eq("status", "published").single()
  if (!data) {
    return buildPageMetadata({
      title: getSiteTitle("Etkinlik"),
      description: "Etkinlik detayı",
      path: `/etkinlikler/${slug}`,
    })
  }
  const row = data as { title: string; short_description?: string | null }
  return buildPageMetadata({
    title: getSiteTitle(row.title),
    description: row.short_description ?? "Yazılım ve teknoloji etkinliği.",
    path: `/etkinlikler/${slug}`,
  })
}

export default async function EtkinlikSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from("platform_events")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!event) notFound()

  const ev = event as unknown as EventRow
  const start = ev.start_date ? new Date(ev.start_date) : null
  const end = ev.end_date ? new Date(ev.end_date) : null
  const deadline = ev.registration_deadline ? new Date(ev.registration_deadline) : null

  let isRegistered = false
  let canRegister = false
  let cannotRegisterReason: string | null = null
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: reg } = await supabase
      .from("platform_event_registrations")
      .select("id")
      .eq("event_id", ev.id)
      .eq("user_id", user.id)
      .maybeSingle()
    isRegistered = !!reg
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    const role = (profile as { role?: string } | null)?.role
    const { data: member } = await supabase.from("community_members").select("id").eq("user_id", user.id).maybeSingle()
    if (role && ["developer", "admin", "platform_admin"].includes(role) && member) {
      canRegister = true
    } else if (!member) {
      cannotRegisterReason = "Etkinliğe kayıt olmak için topluluk üyesi olmanız gerekiyor"
    } else if (!role || !["developer", "admin", "platform_admin"].includes(role)) {
      cannotRegisterReason = "Sadece geliştirici veya yönetici hesapları kayıt olabilir"
    }
  }

  const { data: speakers } = await supabase
    .from("platform_event_speakers")
    .select("full_name, title, photo_url, linkedin_url, github_url, talk_title")
    .eq("event_id", ev.id)
    .order("sort_order", { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden pb-12 pt-28">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <Link href="/etkinlikler" className="text-sm text-muted-foreground hover:text-foreground">
              ← Etkinliklere dön
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">{TYPE_LABELS[ev.type] ?? ev.type}</Badge>
            {ev.featured && <Badge>Öne çıkan</Badge>}
            {ev.tags?.map((t) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{ev.title}</h1>
          {ev.short_description && (
            <p className="text-xl text-muted-foreground mb-6">{ev.short_description}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {start && (
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                {start.toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                {end && ` – ${end.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`}
                {!end && start.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            {ev.is_online ? (
              <span className="flex items-center gap-1.5">
                <Video className="size-4" />
                Online
                {ev.online_platform && ` (${ev.online_platform})`}
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {ev.location?.venue ?? ev.location?.city ?? "Yer bilgisi"}
              </span>
            )}
          </div>
          <div className="mt-6">
            <EventRegisterButton
              eventId={ev.id}
              isRegistered={isRegistered}
              canRegister={canRegister}
              cannotRegisterReason={cannotRegisterReason}
              isLoggedIn={!!user}
            />
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {ev.cover_image_url && (
            <div className="rounded-2xl overflow-hidden border border-border mb-6">
              <img src={ev.cover_image_url} alt="" className="w-full aspect-video object-cover" />
            </div>
          )}

          <Card className="rounded-2xl border border-border shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-8">
              {ev.description && (
                <section>
                  <h2 className="text-lg font-semibold text-foreground mb-3">Detaylar</h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground prose-ul:my-3 prose-li:my-0.5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{ev.description}</ReactMarkdown>
                  </div>
                </section>
              )}

              {((ev.is_online && ev.online_link) || (!ev.is_online && ev.location)) ? (
                <section className={ev.description ? "pt-6 border-t border-border" : ""}>
                  <h2 className="text-lg font-semibold text-foreground mb-3">Konum & Katılım</h2>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                    {ev.is_online && ev.online_link ? (
                      <li>
                        <a
                          href={ev.online_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          {ev.online_platform ?? "Etkinlik linki"}
                          <ExternalLink className="inline size-4 ml-0.5 align-middle" />
                        </a>
                      </li>
                    ) : (
                      <>
                        {ev.location?.venue && <li><strong className="text-foreground">Mekan:</strong> {ev.location.venue}</li>}
                        {ev.location?.city && <li><strong className="text-foreground">Şehir:</strong> {ev.location.city}</li>}
                        {ev.location?.address && <li>{ev.location.address}</li>}
                        {ev.location?.map_link && (
                          <li>
                            <a href={ev.location.map_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              Haritada göster <ExternalLink className="inline size-4 ml-0.5 align-middle" />
                            </a>
                          </li>
                        )}
                      </>
                    )}
                  </ul>
                </section>
              ) : null}

              {(ev.organizer_name || ev.contact_email) && (
                <section className="pt-6 border-t border-border">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Organizasyon</h2>
                  <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                    {ev.organizer_name && (
                      <li className="flex items-center gap-2">
                        <User className="size-4 shrink-0 text-muted-foreground" />
                        {ev.organizer_website ? (
                          <a href={ev.organizer_website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                            {ev.organizer_name}
                          </a>
                        ) : (
                          ev.organizer_name
                        )}
                      </li>
                    )}
                    {ev.contact_email && (
                      <li>
                        <a href={`mailto:${ev.contact_email}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                          <Mail className="size-4" />
                          {ev.contact_email}
                        </a>
                      </li>
                    )}
                  </ul>
                </section>
              )}

              {ev.registration_required && (deadline || ev.max_participants != null) && (
                <section className="pt-6 border-t border-border">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Katılım</h2>
                  <ul className="space-y-1.5 text-muted-foreground list-disc list-inside">
                    {ev.attendance_type === "free" ? (
                      <li>Ücretsiz</li>
                    ) : (
                      <li>Ücretli · {ev.price} TL</li>
                    )}
                    {ev.max_participants != null && <li>Kontenjan: {ev.max_participants} kişi</li>}
                    {deadline && <li>Son kayıt: {deadline.toLocaleDateString("tr-TR")}</li>}
                  </ul>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ev.attendance_type === "free" ? (
                      <Badge variant="secondary">Ücretsiz</Badge>
                    ) : (
                      <Badge variant="secondary">{ev.price} TL</Badge>
                    )}
                    {ev.max_participants != null && (
                      <Badge variant="outline">Kontenjan: {ev.max_participants} kişi</Badge>
                    )}
                    {deadline && (
                      <Badge variant="outline">Son kayıt: {deadline.toLocaleDateString("tr-TR")}</Badge>
                    )}
                  </div>
                </section>
              )}

              {ev.type === "hackathon" && (ev.theme_description || (ev.technologies?.length)) && (
                <section className="pt-6 border-t border-border">
                  <h2 className="text-lg font-semibold text-foreground mb-3">Hackathon</h2>
                  {ev.theme_description && <p className="text-muted-foreground mb-4">{ev.theme_description}</p>}
                  {ev.technologies?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {ev.technologies.map((t) => (
                        <Badge key={t} variant="secondary">{t}</Badge>
                      ))}
                    </div>
                  ) : null}
                </section>
              )}

              {speakers?.length ? (
                <section className="pt-6 border-t border-border">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Konuşmacılar</h2>
                  <ul className="grid gap-4 sm:grid-cols-2 list-none pl-0 space-y-0">
                    {speakers.map((s, i) => (
                      <li key={i} className="flex gap-4 rounded-xl border border-border bg-muted/30 p-4">
                        {(s as { photo_url?: string | null }).photo_url ? (
                          <img
                            src={(s as { photo_url: string }).photo_url}
                            alt=""
                            className="size-14 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="size-14 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User className="size-7 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{(s as { full_name: string }).full_name}</p>
                          {(s as { title?: string | null }).title && (
                            <p className="text-sm text-muted-foreground">{(s as { title: string }).title}</p>
                          )}
                          {(s as { talk_title?: string | null }).talk_title && (
                            <p className="text-sm mt-1 text-foreground">{(s as { talk_title: string }).talk_title}</p>
                          )}
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {(s as { linkedin_url?: string | null }).linkedin_url && (
                              <a href={(s as { linkedin_url: string }).linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">LinkedIn</a>
                            )}
                            {(s as { github_url?: string | null }).github_url && (
                              <a href={(s as { github_url: string }).github_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">GitHub</a>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
