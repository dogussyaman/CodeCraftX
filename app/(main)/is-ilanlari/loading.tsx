import { JobCardSkeleton } from "@/components/skeleton-loaders"

export default function IsIlanlariLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="h-16 w-3/4 mx-auto bg-muted animate-pulse rounded" />
            <div className="h-6 w-2/3 mx-auto bg-muted animate-pulse rounded" />
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="flex-1 h-12 bg-muted animate-pulse rounded-lg" />
              <div className="h-12 w-32 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Filters Skeleton */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-24 bg-muted animate-pulse rounded-full" />
            ))}
          </div>
        </div>
      </section>

      {/* Jobs Grid Skeleton */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
