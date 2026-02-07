import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, ExternalLink, Code2 } from "lucide-react"
import { redirect } from "next/navigation"
import { ProjectDeleteButton } from "@/app/dashboard/gelistirici/projelerim/_components/ProjectDeleteButton"
import { JoinRequestsList } from "@/app/dashboard/gelistirici/projelerim/_components/JoinRequestsList"
import Image from "next/image"

export default async function AdminProjelerPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/giris")

  const { data: projeler } = await supabase
    .from("projects")
    .select("id, title, description, status, category, image_url, github_url, demo_url, technologies, stars, created_at")
    .eq("created_by", user.id)
    .order("updated_at", { ascending: false })

  const projectIds = (projeler ?? []).map((p) => p.id)
  const { data: joinRequests } =
    projectIds.length > 0
      ? await supabase
        .from("project_join_requests")
        .select("id, project_id, user_id, message, created_at, projects(title), profiles(full_name)")
        .in("project_id", projectIds)
        .eq("status", "pending")
      : { data: [] }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Code2 className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Projeler</h1>
            <p className="text-sm text-muted-foreground">Açık kaynak projelerinizi yönetin ve toplulukla paylaşın.</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/projeler/yeni" className="gap-2">
            <Plus className="size-4" />
            Yeni Proje
          </Link>
        </Button>
      </div>

      {joinRequests && joinRequests.length > 0 && (
        <JoinRequestsList requests={joinRequests as Parameters<typeof JoinRequestsList>[0]["requests"]} />
      )}

      {!projeler?.length ? (
        <Card className="rounded-2xl border-dashed border-border bg-muted/30 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Code2 className="size-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Henüz proje eklemediniz</h3>
            <p className="text-muted-foreground mb-4">İlk projenizi ekleyerek başlayın.</p>
            <Button asChild>
              <Link href="/dashboard/admin/projeler/yeni" className="gap-2">
                <Plus className="size-4" />
                İlk Projenizi Ekleyin
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {projeler.map((proje) => {
            const teknolojiler = Array.isArray(proje.technologies)
              ? proje.technologies
              : typeof proje.technologies === "string"
                ? JSON.parse(proje.technologies || "[]")
                : []
            return (
              <Card key={proje.id} className="rounded-2xl border border-border bg-card shadow-sm group hover:shadow-lg transition-all duration-300 hover:border-primary/50 pt-0 overflow-hidden">
                 <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                    {proje.image_url ? (
                      <Image
                        src={proje.image_url}
                        alt={proje.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Code2 className="size-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                <CardHeader className="flex flex-row items-start justify-between gap-2 pt-0"> 
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate">{proje.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">{proje.description}</CardDescription>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Badge variant={proje.status === "published" ? "default" : "secondary"}>
                      {proje.status === "published" ? "Yayında" : "Taslak"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {teknolojiler.slice(0, 5).map((t: string) => (
                      <Badge key={t} variant="outline" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                    {teknolojiler.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{teknolojiler.length - 5}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/admin/projeler/${proje.id}/duzenle`} className="gap-1">
                        <Pencil className="size-3.5" />
                        Düzenle
                      </Link>
                    </Button>
                    {proje.status === "published" && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/projeler/${proje.id}`} target="_blank" className="gap-1">
                          <ExternalLink className="size-3.5" />
                          Görüntüle
                        </Link>
                      </Button>
                    )}
                    <ProjectDeleteButton projectId={proje.id} projectTitle={proje.title} />
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
