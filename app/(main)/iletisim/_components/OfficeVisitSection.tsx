import { CONTACT } from "@/lib/constants"
import { MapPin } from "lucide-react"

export function OfficeVisitSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Ofisimizi Ziyaret Edin</h2>
          <div className="aspect-video rounded-xl bg-muted border border-border overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Harita entegrasyonu yakında eklenecek</p>
                <p className="text-sm text-muted-foreground mt-2">{CONTACT.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
