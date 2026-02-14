import { MatchCardSkeleton } from "@/components/skeleton-loaders"

export default function HRMatchesLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      <div>
        <div className="h-9 w-48 bg-muted animate-pulse rounded mb-2" />
        <div className="h-5 w-64 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
