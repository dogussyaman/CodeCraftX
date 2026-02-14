import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Building2 } from "lucide-react"

interface HrCompanyCalloutProps {
    companyCount: number | null
}

export function HrCompanyCallout({ companyCount }: HrCompanyCalloutProps) {
    if (companyCount && companyCount > 0) return null

    return (
        <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Building2 className="size-5" />
          Şirket Ataması Gerekli
                </CardTitle>
        <CardDescription>
          İş ilanı yayınlayabilmeniz için profilinizin bir şirkete atanmış olması gerekiyor. Lütfen sistem yöneticinizle veya
          şirket yetkilinizle iletişime geçin.
        </CardDescription>
            </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Şirket atamanız yapıldıktan sonra ilanlarınız otomatik olarak bu şirkete bağlı olacaktır.
        </p>
      </CardContent>
        </Card>
    )
}

