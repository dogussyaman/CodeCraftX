import { Skeleton } from "@/components/ui/skeleton"

export function CommunityHeroSkeleton() {
  return (
    <div className="relative min-h-[38vh] w-full overflow-hidden rounded-b-[2rem] bg-muted/40 pt-20 pb-14 md:min-h-[40vh] md:pt-24 md:pb-20">
      <div className="container relative z-10 mx-auto px-4 max-w-6xl">
        <div className="max-w-2xl">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="mt-4 h-10 w-full max-w-md" />
          <Skeleton className="mt-3 h-6 w-full max-w-lg" />
          <Skeleton className="mt-2 h-6 w-4/5 max-w-md" />
          <div className="mt-6 flex items-center gap-3">
            <Skeleton className="h-1 w-16 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="mt-6 h-9 w-32 rounded-md" />
        </div>
      </div>
    </div>
  )
}
