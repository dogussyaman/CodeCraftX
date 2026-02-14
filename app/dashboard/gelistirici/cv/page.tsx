import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { CVDeleteButton } from "./cv-delete-button"

export default async function CVPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: cvs } = await supabase
    .from("cvs")
    .select("*")
    .eq("developer_id", user!.id)
    .order("created_at", { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return (
          <Badge variant="success">
            <CheckCircle className="mr-1 size-3" />
            İşlendi
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 size-3" />
            İşleniyor
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 size-3" />
            Hata
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">CV Yönetimi</h1>
          <p className="text-muted-foreground">CV'lerinizi yükleyin ve yönetin</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/gelistirici/cv/yukle">
            <Upload className="mr-2 size-4" />
            Yeni CV Yükle
          </Link>
        </Button>
      </div>

      {/* CV Listesi */}
      {!cvs || cvs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="size-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Henüz CV yüklemediniz</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Eşleşme algoritmasının çalışması için lütfen CV'nizi yükleyin
            </p>
            <Button asChild>
              <Link href="/dashboard/gelistirici/cv/yukle">
                <Upload className="mr-2 size-4" />
                İlk CV'nizi Yükleyin
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {cvs.map((cv) => (
            <Card key={cv.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="size-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{cv.file_name}</CardTitle>
                      <CardDescription className="mt-1">Yüklenme: {formatDate(cv.created_at)}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(cv.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {/* Analiz Özeti */}
                  {cv.parsed_data && (
                    <div className="space-y-2 text-sm">
                      {cv.parsed_data.summary && (
                        <p className="text-muted-foreground leading-relaxed">
                          <span className="font-medium text-foreground">Özet:</span>{" "}
                          {cv.parsed_data.summary}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {cv.parsed_data.experience_years && (
                          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                            Toplam deneyim: {cv.parsed_data.experience_years} yıl
                          </span>
                        )}

                        {cv.parsed_data.seniority && (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            Seviye: {cv.parsed_data.seniority}
                          </span>
                        )}
                      </div>

                      {cv.parsed_data.roles?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Roller:</span>
                          {cv.parsed_data.roles.map((role: string) => (
                            <Badge key={role} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {cv.parsed_data.skills?.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            Tespit edilen yetenekler ({cv.parsed_data.skills.length}):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {cv.parsed_data.skills.map((skill: string) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs bg-primary/5 text-foreground"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={cv.file_url} target="_blank">
                        Görüntüle
                      </Link>
                    </Button>
                    <CVDeleteButton cvId={cv.id} fileUrl={cv.file_url} status={cv.status} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
