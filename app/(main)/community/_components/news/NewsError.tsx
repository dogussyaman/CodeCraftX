import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface NewsErrorProps {
  message?: string
}

export function NewsError({ message = "Haberler yüklenirken bir hata oluştu." }: NewsErrorProps) {
  return (
    <Card className="border-dashed border-border bg-muted/20">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="size-12 text-muted-foreground" aria-hidden />
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}
