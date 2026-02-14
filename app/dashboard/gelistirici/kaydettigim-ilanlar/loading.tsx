import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function KaydettigimIlanlarLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      <div>
        <div className="h-9 w-56 bg-muted animate-pulse rounded mb-2" />
        <div className="h-5 w-72 bg-muted animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader>
              <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded mt-2" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="h-9 w-24 bg-muted animate-pulse rounded" />
                <div className="h-9 w-20 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
