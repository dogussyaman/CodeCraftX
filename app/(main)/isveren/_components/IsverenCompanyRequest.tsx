import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import { CreateCompanyRequestForm } from "@/components/company-request/create-company-request-form"

export function IsverenCompanyRequest() {
  return (
    <section id="sirket-talebi" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <CardTitle>Şirket kayıt talebi</CardTitle>
              </div>
              <CardDescription>
                Platformda şirket hesabı açmak için giriş yapıp talebinizi gönderin. İncelendikten sonra size dönüş yapacağız.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<p className="text-sm text-muted-foreground py-4">Yükleniyor...</p>}>
                <CreateCompanyRequestForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
