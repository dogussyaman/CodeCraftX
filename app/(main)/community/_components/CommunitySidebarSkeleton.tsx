import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function CommunitySidebarSkeleton() {
  return (
    <aside className="flex w-full flex-col gap-6 lg:w-[280px] lg:shrink-0">
      <Card className="overflow-hidden border-border bg-card">
        <CardHeader>
          <Skeleton className="h-20 w-full rounded" />
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-2">
          <Skeleton className="mx-auto mt-3 h-5 w-3/4" />
          <Skeleton className="mx-auto mt-2 h-4 w-full" />
          <Skeleton className="mx-auto mt-1 h-4 w-full" />
          <div className="mt-3 flex justify-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-9 w-full rounded-md" />
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-1 h-3 w-full" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
          </div>
          <ul className="mt-3 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i}>
                <Skeleton className="h-8 w-full rounded-md" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </aside>
  )
}
