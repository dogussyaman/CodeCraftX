import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Building2, Star, Users } from "lucide-react"

interface AdminMainStatsProps {
    totalUsers: number | null
    companyCount: number | null
    jobCount: number | null
    activeJobCount: number | null
    matchCount: number | null
}

export function AdminMainStats({
    totalUsers,
    companyCount,
    jobCount,
    activeJobCount,
    matchCount,
}: AdminMainStatsProps) {
    const cardClass =
        "bg-card border border-indigo-500/20 border-t-4 border-t-indigo-500/40 dark:border-indigo-500/25 dark:border-t-indigo-500/30"
    const iconClass = "size-5 text-indigo-600 dark:text-indigo-400"

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className={cardClass}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Kullanıcı</CardTitle>
                    <Users className={iconClass} />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Kayıtlı kullanıcı</p>
                </CardContent>
            </Card>

            <Card className={cardClass}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Şirketler</CardTitle>
                    <Building2 className={iconClass} />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{companyCount || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Kayıtlı şirket</p>
                </CardContent>
            </Card>

            <Card className={cardClass}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">İş İlanları</CardTitle>
                    <Briefcase className={iconClass} />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{jobCount || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">{activeJobCount || 0} aktif</p>
                </CardContent>
            </Card>

            <Card className={cardClass}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Eşleşmeler</CardTitle>
                    <Star className={iconClass} />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{matchCount || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Toplam eşleşme</p>
                </CardContent>
            </Card>
        </div>
    )
}

