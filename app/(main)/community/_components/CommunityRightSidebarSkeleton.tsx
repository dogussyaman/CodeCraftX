import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function CommunityRightSidebarSkeleton() {
  return (
    <aside className="flex w-full flex-col gap-6 lg:w-[280px] lg:shrink-0">
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="size-8 rounded" />
          </div>
          <ul className="mt-3 space-y-3">
            {[1, 2, 3].map((i) => (
              <li key={i} className="flex gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <Skeleton className="size-10 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </li>
            ))}
          </ul>
          <Skeleton className="mt-3 h-9 w-full rounded-md" />
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <Skeleton className="h-4 w-40" />
          <p className="mt-1 text-xs text-muted-foreground">Topluluğu kullandığınız araçlarla bağlayın.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="size-12 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}
