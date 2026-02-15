import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, ChevronDown } from "lucide-react"

const FILTER_TABS = [
  { id: "all", label: "Tümü" },
  { id: "trending", label: "Öne çıkan" },
  { id: "duyurular", label: "#Duyurular" },
  { id: "blog", label: "#Blog" },
  { id: "turkish", label: "Türkiye Haberleri" },
  { id: "global", label: "Global Teknoloji" },
  { id: "news-all", label: "Tüm Haberler" },
]

export function CommunityFeedsSkeleton() {
  return (
    <div id="feed" className="flex min-w-0 flex-1 flex-col gap-6">
      {/* Arama - gerçek input, hemen */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Anahtar kelime, #etiket veya @isim ara..." className="pl-9" disabled readOnly />
        </div>
      </div>

      {/* Blog ekleme alanı - gerçek UI, hemen */}
      <Card className="overflow-hidden border-border bg-card">
        <CardContent className="p-0">
          <Link
            href="/auth/giris"
            className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/30"
          >
            <Avatar className="size-10 shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary">?</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Aklınızdan ne geçiyor? (Giriş yaparak paylaşın)
            </div>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        </CardContent>
      </Card>

      {/* Kategori sekmeleri - gerçek etiketler, hemen */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <Button key={tab.id} variant={tab.id === "all" ? "secondary" : "ghost"} size="sm" disabled className="pointer-events-none">
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Haberler & Yazılar - başlık hemen, sadece backend verisi (kart listesi) skeleton */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Haberler &amp; Yazılar</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden border-border bg-card pt-0">
              <Skeleton className="aspect-video w-full" />
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="size-9 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="mt-3 h-5 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
                <div className="mt-3 flex gap-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
