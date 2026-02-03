import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, ChevronRight, PenLine } from "lucide-react"

interface RecentPost {
  id: string
  title: string
  slug: string
  status: string
  published_at: string | null
  created_at: string
  cover_image_url: string | null
}

interface DeveloperRecentPostsProps {
  recentPosts: RecentPost[] | null
}

export function DeveloperRecentPosts({ recentPosts }: DeveloperRecentPostsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          Son yazılarım
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/5 hover:text-primary">
            <Link href="/dashboard/gelistirici/yazilarim/yeni">
              <PenLine className="mr-1 size-4" />
              Yeni yazı
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="hover:bg-primary/5 hover:text-primary">
            <Link href="/dashboard/gelistirici/yazilarim">
              Tümünü gör <ChevronRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {!recentPosts || recentPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <BookOpen className="size-6 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground text-sm mb-4">Henüz blog yazınız yok.</p>
              <Button size="sm" asChild>
                <Link href="/dashboard/gelistirici/yazilarim/yeni" className="gap-1">
                  <PenLine className="size-3.5" />
                  İlk yazınızı oluşturun
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/dashboard/gelistirici/yazilarim/${post.id}/duzenle`}
                  className="group flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="size-14 shrink-0 rounded-lg overflow-hidden bg-muted border border-border">
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center text-muted-foreground/50">
                        <BookOpen className="size-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-foreground group-hover:text-primary">
                      {post.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString("tr-TR")
                        : new Date(post.created_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <Badge variant={post.status === "published" ? "default" : "secondary"} className="shrink-0">
                    {post.status === "published" ? "Yayında" : "Taslak"}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
