import { JobCardSkeleton } from "@/components/skeleton-loaders"

export default function JobsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-5 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
