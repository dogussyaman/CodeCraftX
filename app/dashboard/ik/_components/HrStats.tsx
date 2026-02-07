import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Building2, Star, Users } from "lucide-react"

interface HrStatsProps {
    companyCount: number | null
    jobCount: number | null
    applicationCount: number | null
}

export function HrStats({ companyCount, jobCount, applicationCount }: HrStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-card border border-border rounded-xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Şirketler</CardTitle>
                    <Building2 className="size-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{companyCount || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Kayıtlı şirket</p>
                </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Aktif İlanlar</CardTitle>
                    <Briefcase className="size-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{jobCount || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">İş ilanı</p>
                </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Başvurular</CardTitle>
                    <Users className="size-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{applicationCount || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Toplam başvuru</p>
                </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Eşleşmeler</CardTitle>
                    <Star className="size-5 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">-</div>
                    <p className="text-xs text-muted-foreground mt-1">Potansiyel aday</p>
                </CardContent>
            </Card>
        </div>
    )
}

