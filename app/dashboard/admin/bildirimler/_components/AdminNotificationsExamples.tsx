"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Code2,
  Users,
  Building2,
  Settings,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import type { NotificationTemplateValues } from "../page"

const ROLE_ICONS: Record<string, LucideIcon> = {
  Geliştirici: Code2,
  İK: Users,
  "Şirket Yöneticisi": Building2,
  "Sistem / Operasyon": Settings,
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  "Geliştirici": "İlan ve başvuru bildirimleri",
  "İK": "Başvuru ve aday hatırlatmaları",
  "Şirket Yöneticisi": "Eşleşme ve ilan raporları",
  "Sistem / Operasyon": "Bakım ve güvenlik duyuruları",
}

const EXAMPLES: Array<{
  role: string
  targetRole: string
  items: Array<{
    title: string
    body: string
    link: string
  }>
}> = [
  {
    role: "Geliştirici",
    targetRole: "developer",
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
    targetRole: "hr",
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
    targetRole: "company_admin",
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
    targetRole: "all",
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
]

interface AdminNotificationsExamplesProps {
  onSelectTemplate: (values: NotificationTemplateValues) => void
}

export function AdminNotificationsExamples({ onSelectTemplate }: AdminNotificationsExamplesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Hazır Şablonlar</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Rol bazlı şablonlardan birini seçin; form otomatik doldurulur, isterseniz düzenleyip gönderin.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {EXAMPLES.map((group) => {
          const RoleIcon = ROLE_ICONS[group.role] ?? Settings
          const description = ROLE_DESCRIPTIONS[group.role] ?? ""
          return (
            <Card
              key={group.role}
              className="overflow-hidden border-border bg-card shadow-sm transition-colors hover:border-primary/30 hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <RoleIcon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">{group.role}</CardTitle>
                    {description && (
                      <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="group/item flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3 transition-colors hover:border-primary/25 hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-medium text-sm text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.body}</p>
                      {item.link ? (
                        <p className="text-xs text-muted-foreground truncate">Link: {item.link}</p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="shrink-0 gap-1 group-hover/item:bg-primary/90"
                      onClick={() =>
                        onSelectTemplate({
                          title: item.title,
                          body: item.body,
                          href: item.link,
                          targetRole: group.targetRole,
                        })
                      }
                    >
                      Bu şablonu kullan
                      <ChevronRight className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
