import Link from "next/link"
import Image from "next/image"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, ExternalLink, Code2 } from "lucide-react"
import { redirect } from "next/navigation"
import { ProjectDeleteButton } from "./_components/ProjectDeleteButton"
import { JoinRequestsList } from "./_components/JoinRequestsList"

export default async function ProjelerimPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/giris")

  const { data: projeler } = await supabase
    .from("projects")
    .select("id, title, description, status, category, github_url, demo_url, technologies, stars, created_at, image_url")
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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projelerim</h1>
          <p className="text-muted-foreground">Açık kaynak projelerinizi yönetin ve toplulukla paylaşın.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/gelistirici/projelerim/yeni" className="gap-2">
            <Plus className="size-4" />
            Yeni Proje
          </Link>
        </Button>
      </div>

      {joinRequests && joinRequests.length > 0 ? (
        <JoinRequestsList requests={joinRequests as Parameters<typeof JoinRequestsList>[0]["requests"]} />
      ) : projeler && projeler.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          Projelerinize gelen katılma istekleri burada listelenecek. Henüz bekleyen istek yok.
        </p>
      ) : null}

      {!projeler?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Code2 className="size-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Henüz proje eklemediniz.</p>
            <Button asChild>
              <Link href="/dashboard/gelistirici/projelerim/yeni" className="gap-2">
                <Plus className="size-4" />
                İlk Projenizi Ekleyin
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projeler.map((proje) => {
            const teknolojiler = Array.isArray(proje.technologies)
              ? proje.technologies
              : typeof proje.technologies === "string"
                ? JSON.parse(proje.technologies || "[]")
                : []
            return (
              <Card key={proje.id}>
                {proje.image_url && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                    <Image
                      src={proje.image_url}
                      alt={proje.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}
                <CardHeader className="flex flex-row items-start justify-between gap-2">
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
                      <Link href={`/dashboard/gelistirici/projelerim/${proje.id}/duzenle`} className="gap-1">
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
