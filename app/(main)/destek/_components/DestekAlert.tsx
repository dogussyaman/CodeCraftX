import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function DestekAlert() {
  return (
    <section className="pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Önemli Duyuru</AlertTitle>
            <AlertDescription>
              Sistem bakımı nedeniyle 15 Ocak 2026 tarihinde 02:00-04:00 saatleri arasında hizmetlerimizde
              kesinti yaşanabilir.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </section>
  )
}
