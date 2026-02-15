import { Card, CardContent } from "@/components/ui/card"
import { Newspaper } from "lucide-react"

export function NewsEmpty() {
  return (
    <Card className="border-dashed border-border bg-muted/20">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Newspaper className="size-12 text-muted-foreground" aria-hidden />
        <p className="mt-2 text-sm text-muted-foreground">
          Bu kategoride henüz haber yok.
        </p>
      </CardContent>
    </Card>
  )
}
