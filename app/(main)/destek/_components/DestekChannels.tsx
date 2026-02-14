import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CONTACT } from "@/lib/constants"
import { Mail, Phone, MessageCircle, Clock, ArrowRight } from "lucide-react"

export function DestekChannels() {
  return (
    <section className="pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Destek Kanalları</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Mail className="h-8 w-8 text-primary" />
                  <Badge variant="outline">7/24</Badge>
                </div>
                <CardTitle>E-posta Desteği</CardTitle>
                <CardDescription>Detaylı sorularınız için</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {CONTACT.supportEmail} adresinden bize ulaşın.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Ortalama yanıt: 2-4 saat</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Phone className="h-8 w-8 text-primary" />
                  <Badge>Hafta içi</Badge>
                </div>
                <CardTitle>Telefon Desteği</CardTitle>
                <CardDescription>Acil durumlar için</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{CONTACT.email} ve {CONTACT.supportEmail} üzerinden iletişime geçin.</p>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">09:00 - 18:00</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-primary/50">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <MessageCircle className="h-8 w-8 text-primary" />
                  <Badge variant="success">Çevrimiçi</Badge>
                </div>
                <CardTitle>Canlı Destek</CardTitle>
                <CardDescription>Anında yardım alın</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Sohbet başlatın, hemen yardımcı olalım.
                </p>
                <Button className="w-full group" asChild>
                  <a href="/iletisim">
                    Sohbet Başlat
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
