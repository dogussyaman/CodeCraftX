import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { BookOpen, Briefcase, Star, Upload } from "lucide-react"

export function DeveloperSidebar() {
    return (
        <div className="space-y-6">
            <Card className="from-card to-muted/30 border-border">
                <CardContent className="p-6">
                    <CardTitle className="text-lg mb-4">Hızlı İşlemler</CardTitle>
                    <div className="grid gap-3">
                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-3 px-4 hover:border-primary/50 hover:bg-primary/5 transition-all"
                            asChild
                        >
                            <Link href="/dashboard/gelistirici/cv/yukle">
                                <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                                    <Upload className="size-4" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium">Yeni CV Yükle</div>
                                    <div className="text-xs text-muted-foreground">Profilinizi güncel tutun</div>
                                </div>
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-3 px-4 hover:border-primary/50 hover:bg-primary/5 transition-all"
                            asChild
                        >
                            <Link href="/dashboard/gelistirici/basvurular">
                                <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                                    <Briefcase className="size-4" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium">Başvurularım</div>
                                    <div className="text-xs text-muted-foreground">Durum kontrolü yapın</div>
                                </div>
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto py-3 px-4 hover:border-primary/50 hover:bg-primary/5 transition-all"
                            asChild
                        >
                            <Link href="/dashboard/gelistirici/yazilarim/yeni">
                                <div className="p-2 rounded-full bg-primary/10 text-primary mr-3">
                                    <BookOpen className="size-4" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium">Yeni blog yazısı</div>
                                    <div className="text-xs text-muted-foreground">Blog yazınızı oluşturun</div>
                                </div>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none bg-primary/5 dark:bg-primary/10 shadow-none">
                <CardContent className="p-6">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Star className="size-4 text-primary fill-primary" />
                        İpucu
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Profil doluluk oranınızı artırmak, daha iyi iş eşleşmeleri almanızı sağlar. Yeteneklerinizi
                        detaylandırmayı unutmayın.
                    </p>
                    <Button size="sm" variant="link" asChild className="p-0 h-auto text-primary">
                        <Link href="/dashboard/gelistirici/profil">Profile Git →</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

