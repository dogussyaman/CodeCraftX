import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Calendar } from "lucide-react"
import { EventDeleteButton } from "./_components/EventDeleteButton"

export default async function AdminEtkinliklerPage() {
  const supabase = await createClient()
  const { data: events } = await supabase
    .from("platform_events")
    .select("id, title, slug, type, status, start_date, end_date, featured, created_at, cover_image_url, short_description, attendance_type, price")
    .order("start_date", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Calendar className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Etkinlikler</h1>
            <p className="text-sm text-muted-foreground">Platform etkinliklerini yönetin</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/etkinlikler/olustur" className="gap-2">
            <Plus className="size-4" />
            Yeni etkinlik
          </Link>
        </Button>
      </div>

      {!events?.length ? (
        <Card className="rounded-2xl border-dashed border-border bg-muted/30 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="size-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Henüz etkinlik yok</h3>
            <p className="text-muted-foreground mb-4">İlk etkinliği oluşturun</p>
            <Button asChild>
              <Link href="/dashboard/admin/etkinlikler/olustur" className="gap-2">
                <Plus className="size-4" />
                Etkinlik oluştur
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => {
            const start = ev.start_date ? new Date(ev.start_date) : null
            const typeLabels: Record<string, string> = {
              hackathon: "Hackathon",
              seminer: "Seminer",
              workshop: "Workshop",
              konferans: "Konferans",
              webinar: "Webinar",
            }
            return (
              <Card key={ev.id} className="rounded-2xl border border-border bg-card shadow-sm flex flex-col overflow-hidden pt-0">
                <div className="aspect-video w-full overflow-hidden bg-muted border-b border-border">
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
                </div>
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground line-clamp-2">{ev.title}</h3>
                    <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                      <Badge variant={ev.status === "published" ? "default" : ev.status === "cancelled" ? "destructive" : "secondary"}>
                        {ev.status === "published" ? "Yayında" : ev.status === "cancelled" ? "İptal" : "Taslak"}
                      </Badge>
                      {(ev as { featured?: boolean }).featured && (
                        <Badge variant="outline">Öne çıkan</Badge>
                      )}
                      <Badge variant="outline" className="text-xs font-normal">
                        {(ev as { attendance_type?: string }).attendance_type === "free" ? "Ücretsiz" : `Ücretli · ${(ev as { price?: number }).price ?? 0} TL`}
                      </Badge>
                    </div>
                  </div>
                  {(ev as { short_description?: string }).short_description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{(ev as { short_description: string }).short_description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {typeLabels[ev.type] ?? ev.type}
                    {start && ` · ${start.toLocaleDateString("tr-TR")} ${start.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/admin/etkinlikler/${ev.id}/duzenle`} className="gap-1">
                        <Pencil className="size-3.5" />
                        Düzenle
                      </Link>
                    </Button>
                    {ev.status === "published" && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/etkinlikler/${ev.slug}`}>
                          Görüntüle
                        </Link>
                      </Button>
                    )}
                    <EventDeleteButton eventId={ev.id} eventTitle={ev.title} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
