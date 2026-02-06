"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AdminNotificationsExamples() {
    return (
        <Card className="bg-card border-border">
            <CardHeader>
                <CardTitle>Bildirim Örnekleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg border-border">
                    <p className="font-medium">Geliştiriciye Yeni İş İlanı</p>
                    <p className="text-sm text-muted-foreground">
                        Başlık: "Yeni iş ilanı: Senior Frontend Developer" | İçerik: "Profiline uygun yeni ilan
                        yayınlandı. Hemen başvurabilir veya ilanı kaydedebilirsin." | Link: "/is-ilanlari/1234"
                    </p>
                </div>
                <div className="p-3 border rounded-lg border-border">
                    <p className="font-medium">İK Ekibine Yeni Başvuru</p>
                    <p className="text-sm text-muted-foreground">
                        Başlık: "Yeni başvuru geldi" | İçerik: "Full-stack Developer ilanına 3 yeni başvuru var.
                        Adayları inceleyip geri dönüş yapabilirsin." | Link: "/dashboard/ik/basvurular"
                    </p>
                </div>
                <div className="p-3 border rounded-lg border-border">
                    <p className="font-medium">Şirket Hesabına Önerilen Adaylar</p>
                    <p className="text-sm text-muted-foreground">
                        Başlık: "Sana uygun adaylar hazır" | İçerik: "React ve TypeScript tecrübesi olan 5 aday
                        listelendi. Favorilere ekleyebilirsin." | Link: "/dashboard/company/adaylar"
                    </p>
                </div>
                <div className="p-3 border rounded-lg border-border">
                    <p className="font-medium">Sistem Duyurusu</p>
                    <p className="text-sm text-muted-foreground">
                        Başlık: "Planlı bakım" | İçerik: "Sistem 20:00-22:00 arasında bakımda olacak. İşlem
                        yapmadan önce açık başvurularını kaydetmeyi unutma."
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
