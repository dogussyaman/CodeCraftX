"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Ticket, PlusCircle, ImageIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

const typeLabels: Record<string, string> = {
  login_error: "Giriş hatası",
  feedback: "Geri bildirim",
  technical: "Teknik",
  other: "Diğer",
}

const statusLabels: Record<string, string> = {
  open: "Açık",
  in_progress: "İşlemde",
  resolved: "Çözüldü",
  closed: "Kapatıldı",
}

const statusDescriptions: Record<string, string> = {
  open: "Talebiniz alındı, inceleniyor.",
  in_progress: "Destek ekibimiz üzerinde çalışıyor.",
  resolved: "Çözüm uygulandı. Aşağıda çözüm notunu görebilirsiniz.",
  closed: "Talep kapatıldı.",
}

const priorityLabels: Record<string, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
  urgent: "Acil",
}

export interface SupportTicketItem {
  id: string
  subject: string
  type: string
  status: string
  priority: string | null
  created_at: string
  description?: string | null
  resolution_no?: string | null
  resolved_at?: string | null
  attachment_urls?: string[] | null
}

interface MyTicketsListProps {
  tickets: SupportTicketItem[]
}

export function MyTicketsList({ tickets }: MyTicketsListProps) {
  return (
    <TooltipProvider>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-lg font-semibold">Talepleriniz</h2>
        <Button asChild variant="outline" size="sm">
          <Link href="/destek" className="inline-flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Yeni talep oluştur
          </Link>
        </Button>
      </div>
      {!tickets.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground space-y-4">
            <Ticket className="h-12 w-12 mx-auto opacity-50" />
            <p>Henüz destek talebiniz yok.</p>
            <Button asChild variant="secondary">
              <Link href="/destek">İlk talebinizi oluşturun</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <Card key={t.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                <div>
                  <CardTitle className="text-base">{t.subject}</CardTitle>
                  <CardDescription>
                    {typeLabels[t.type] ?? t.type}
                    {t.priority && ` · ${priorityLabels[t.priority] ?? t.priority}`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant={t.status === "open" || t.status === "in_progress" ? "default" : "secondary"}>
                        {statusLabels[t.status] ?? t.status}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[240px]">
                      <p>{statusDescriptions[t.status] ?? "Durum bilgisi."}</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(t.created_at), { addSuffix: true, locale: tr })}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {t.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                    {t.description}
                  </p>
                )}
                {t.status === "resolved" && t.resolution_no && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="font-medium">Çözüm notu:</span> {t.resolution_no}
                  </p>
                )}
                {t.attachment_urls && t.attachment_urls.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {t.attachment_urls.length} ek
                    </span>
                    <div className="flex gap-1">
                      {t.attachment_urls.slice(0, 3).map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block w-10 h-10 rounded border bg-muted overflow-hidden shrink-0"
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </a>
                      ))}
                      {t.attachment_urls.length > 3 && (
                        <span className="text-xs text-muted-foreground self-center">
                          +{t.attachment_urls.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </TooltipProvider>
  )
}
