import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CONTACT } from "@/lib/constants"
import { Mail, MapPin } from "lucide-react"

export function ContactInfoCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>İletişim Kanalları</CardTitle>
        <CardDescription>
          Size en hızlı şekilde dönüş yapabilmemiz için aşağıdaki kanalları kullanabilirsiniz. Ortalama yanıt
          süresi 24 saattir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Mail className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">E-posta</h3>
            <p className="text-sm text-muted-foreground">{CONTACT.email}</p>
            <p className="text-sm text-muted-foreground">{CONTACT.supportEmail}</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <MapPin className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Adres</h3>
            <p className="text-sm text-muted-foreground">{CONTACT.address}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
