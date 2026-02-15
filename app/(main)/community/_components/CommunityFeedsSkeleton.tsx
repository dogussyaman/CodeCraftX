import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function CommunityFeedsSkeleton() {
  return (
    <div id="feed" className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-10 flex-1 rounded-md" />
      </div>

      <Card className="overflow-hidden border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-12 flex-1 rounded-lg" />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-md" />
        ))}
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
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
