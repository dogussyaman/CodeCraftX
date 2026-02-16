import type { Metadata } from "next"
import Link from "next/link"
import { LogIn, MessageSquare } from "lucide-react"

import { buildPageMetadata, getSiteTitle } from "@/lib/seo"
import { createServerClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { TestimonialForm } from "./_components/TestimonialForm"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Yorumlar"),
  description: "CodeCraftX kullanıcılarının deneyimleri ve görüşleri.",
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
      <div className="container mx-auto max-w-3xl px-4">
        <header className="mb-12 text-center">
          <h1 className="mb-4 flex items-center justify-center gap-2 text-4xl font-bold tracking-tight md:text-5xl">
            <MessageSquare className="size-10" />
            Yorumlar
          </h1>
          <p className="text-lg text-muted-foreground">CodeCraftX kullanıcılarının deneyimleri ve görüşleri.</p>
        </header>

        {user ? (
          <div className="mb-12">
            <TestimonialForm />
          </div>
        ) : (
          <Card className="mb-12 border-dashed border-accent-500/30 bg-white/70 dark:bg-zinc-900/60">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="mb-4 text-muted-foreground">Yorum bırakmak için giriş yapın.</p>
              <Button asChild className="gap-2 bg-gradient-to-r from-accent-500 to-accent-400 text-white hover:from-accent-600 hover:to-accent-500">
                <Link href="/auth/giris">
                  <LogIn className="size-4" />
                  Giriş Yap
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <section>
          <h2 className="mb-6 text-xl font-semibold">Paylaşılan Yorumlar</h2>
          {!testimonials?.length ? (
            <Card className="border-accent-500/20 bg-white/70 dark:bg-zinc-900/60">
              <CardContent className="py-12 text-center text-muted-foreground">Henüz yorum yok. İlk yorumu siz bırakın!</CardContent>
            </Card>
          ) : (
            <ul className="space-y-4">
              {testimonials.map((t) => {
                const author = (t as { profiles?: { full_name?: string; avatar_url?: string } | null }).profiles
                const name = author?.full_name ?? "Kullanıcı"
                const avatarUrl = author?.avatar_url ?? null

                return (
                  <li key={t.id}>
                    <Card className="border-accent-500/20 bg-white/70 dark:bg-zinc-900/60">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10">
                            <AvatarImage src={avatarUrl ?? undefined} />
                            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{name}</p>
                            <time dateTime={t.created_at} className="text-sm text-muted-foreground">
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
                        <p className="whitespace-pre-wrap text-foreground/90">{t.body}</p>
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
