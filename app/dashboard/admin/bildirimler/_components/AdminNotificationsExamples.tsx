"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const EXAMPLES = [
  {
    role: "Geliştirici",
    items: [
      {
        title: "Yeni iş eklendi",
        body: "Senior Frontend Developer ilanı yayında. Profilinize uygun 3 yeni ilan var.",
        link: "/is-ilanlari",
      },
      {
        title: "Sana uygun ilanlar",
        body: "Beceri eşleşmenize göre 5 ilan önerildi.",
        link: "/is-ilanlari",
      },
      {
        title: "Başvurun güncellendi",
        body: "React Developer başvurunuz 'Görüşme' aşamasına taşındı.",
        link: "/dashboard/gelistirici/basvurular",
      },
    ],
  },
  {
    role: "İK",
    items: [
      {
        title: "Yeni başvuru geldi",
        body: "Backend Developer ilanına 1 yeni başvuru alındı.",
        link: "/dashboard/ik/basvurular",
      },
      {
        title: "Aday değerlendirme hatırlatması",
        body: "3 başvuru 7 gündür beklemede.",
        link: "/dashboard/ik/basvurular",
      },
    ],
  },
  {
    role: "Şirket Yöneticisi",
    items: [
      {
        title: "Önerilen adaylar hazır",
        body: "İlanınız için eşleşen 4 aday listelendi.",
        link: "/dashboard/company/basvurular",
      },
      {
        title: "İlan performansı raporu",
        body: "Bu ay 12 görüntülenme, 2 başvuru.",
        link: "/dashboard/company/ilanlar",
      },
    ],
  },
  {
    role: "Sistem / Operasyon",
    items: [
      {
        title: "Planlı bakım",
        body: "20:00–22:00 arası sistem bakımda olacaktır.",
        link: "",
      },
      {
        title: "Hesap güvenliği",
        body: "Şifreniz başarıyla güncellendi. Değişiklik sizin değilse destekle iletişime geçin.",
        link: "",
      },
    ],
  },
] as const

export function AdminNotificationsExamples() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Bildirim Örnekleri</CardTitle>
        <CardDescription>
          Rol bazlı gerçekçi şablonlar; formda hedef kitle ve içerik olarak kullanabilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {EXAMPLES.map((group) => (
          <div key={group.role} className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {group.role}
              </Badge>
            </h3>
            <div className="space-y-2">
              {group.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-border bg-muted/20 space-y-1"
                >
                  <p className="font-medium text-sm text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                  {item.link && (
                    <p className="text-xs text-muted-foreground pt-1">Link: {item.link}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
