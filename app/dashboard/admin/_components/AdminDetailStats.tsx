import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, TrendingUp, UserCheck } from "lucide-react"

interface AdminDetailStatsProps {
    developerCount: number | null
    hrCount: number | null
    cvCount: number | null
    processedCVCount: number | null
    applicationCount: number | null
    jobCount: number | null
}

export function AdminDetailStats({
    developerCount,
    hrCount,
    cvCount,
    processedCVCount,
    applicationCount,
    jobCount,
}: AdminDetailStatsProps) {
    const avgPerJob = jobCount && applicationCount ? Math.round(applicationCount / jobCount) : 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border border-border rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <UserCheck className="size-5 text-primary" />
                        Kullanıcı Dağılımı
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Geliştiriciler</span>
                        <span className="text-sm font-medium">{developerCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">İK Uzmanları</span>
                        <span className="text-sm font-medium">{hrCount || 0}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="size-5 text-primary" />
                        CV İstatistikleri
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Toplam CV</span>
                        <span className="text-sm font-medium">{cvCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">İşlenmiş</span>
                        <span className="text-sm font-medium">{processedCVCount || 0}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border border-border rounded-xl shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Briefcase className="size-5 text-primary" />
                        Başvuru İstatistikleri
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Toplam Başvuru</span>
                        <span className="text-sm font-medium">{applicationCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Ortalama/İlan</span>
                        <span className="text-sm font-medium">{avgPerJob}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

