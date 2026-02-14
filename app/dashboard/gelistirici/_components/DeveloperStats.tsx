import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, FileText, Star } from "lucide-react"

interface DeveloperStatsProps {
    cvCount: number | null
    matchCount: number | null
    applicationCount: number | null
}

export function DeveloperStats({ cvCount, matchCount, applicationCount }: DeveloperStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Yüklenen CV</CardTitle>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <FileText className="size-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-foreground mb-1">{cvCount || 0}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="text-primary font-medium">Güncel</span> CV&apos;niz sistemde kayıtlı
                    </p>
                </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Eşleşmeler</CardTitle>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <Star className="size-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-foreground mb-1">{matchCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Size uygun pozisyon sayısı</p>
                </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Başvurular</CardTitle>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <Briefcase className="size-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-foreground mb-1">{applicationCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Aktif iş başvurunuz</p>
                </CardContent>
            </Card>
        </div>
    )
}

