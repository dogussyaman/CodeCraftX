import type { Metadata } from "next"
import Link from "next/link"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, LogIn } from "lucide-react"
import { TestimonialForm } from "./_components/TestimonialForm"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Yorumlar"),
  description: "Codecrafters kullanıcılarının deneyimleri ve görüşleri.",
  path: "/yorumlar",
})

export default async function YorumlarPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("id, body, created_at, profiles(full_name, avatar_url)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4 max-w-3xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 flex items-center justify-center gap-2">
            <MessageSquare className="size-10" />
            Yorumlar
          </h1>
          <p className="text-lg text-muted-foreground">
            CodeCrafters kullanıcılarının deneyimleri ve görüşleri.
          </p>
        </header>

        {user ? (
          <div className="mb-12">
            <TestimonialForm />
          </div>
        ) : (
          <Card className="mb-12 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground mb-4">Yorum bırakmak için giriş yapın.</p>
              <Button asChild className="gap-2">
                <Link href="/auth/giris">
                  <LogIn className="size-4" />
                  Giriş Yap
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <section>
          <h2 className="text-xl font-semibold mb-6">Paylaşılan Yorumlar</h2>
          {!testimonials?.length ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Henüz yorum yok. İlk yorumu siz bırakın!
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-4">
              {testimonials.map((t) => {
                const author = (t as { profiles?: { full_name?: string; avatar_url?: string } | null }).profiles
                const name = author?.full_name ?? "Kullanıcı"
                const avatarUrl = author?.avatar_url ?? null
                return (
                  <li key={t.id}>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10">
                            <AvatarImage src={avatarUrl ?? undefined} />
                            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{name}</p>
                            <time
                              dateTime={t.created_at}
                              className="text-sm text-muted-foreground"
                            >
                              {new Date(t.created_at).toLocaleDateString("tr-TR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </time>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground/90 whitespace-pre-wrap">{t.body}</p>
                      </CardContent>
                    </Card>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
