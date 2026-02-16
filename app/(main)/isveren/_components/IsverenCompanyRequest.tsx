import { Suspense } from "react"
import { Building2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateCompanyRequestForm } from "@/components/company-request/create-company-request-form"

export function IsverenCompanyRequest() {
  return (
    <section id="sirket-talebi" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <Card className="border border-accent-500/25 bg-white/75 shadow-lg shadow-accent-500/10 dark:bg-zinc-900/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <CardTitle>Şirket Kayıt Talebi</CardTitle>
              </div>
              <CardDescription>
                Platformda şirket hesabı açmak için giriş yapıp talebinizi gönderin. Talebiniz incelendikten sonra size dönüş yapacağız.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<p className="py-4 text-sm text-muted-foreground">Yükleniyor...</p>}>
                <CreateCompanyRequestForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
