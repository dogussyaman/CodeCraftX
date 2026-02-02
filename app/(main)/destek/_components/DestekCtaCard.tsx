import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CONTACT } from "@/lib/constants"
import { Mail, ArrowRight } from "lucide-react"

export function DestekCtaCard() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Sorunuz cevap bulamadı mı?</CardTitle>
              <CardDescription>
                Destek ekibimiz size yardımcı olmak için hazır. Bizimle iletişime geçin.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="group">
                <a href="/iletisim">
                  İletişime Geçin
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href={`mailto:${CONTACT.supportEmail}`}>
                  <Mail className="mr-2 h-4 w-4" />
                  E-posta Gönderin
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
