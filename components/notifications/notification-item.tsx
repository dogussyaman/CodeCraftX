"use client"

import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import Link from "next/link"
import type { Notification } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { getNotificationTypeMeta, getNotificationCtaText } from "@/lib/notifications"
import { ChevronRight } from "lucide-react"

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  /** Verilirse tıklanınca önce detay açılır; verilmezse href varsa doğrudan sayfaya gider */
  onOpenDetail?: (notification: Notification) => void
  /** Tıklanınca çağrılır (örn. navbar dropdown kapatmak için) */
  onClose?: () => void
}

export function NotificationItem({ notification, onMarkAsRead, onOpenDetail, onClose }: NotificationItemProps) {
  const isUnread = !notification.read_at
  const { label, icon: Icon } = getNotificationTypeMeta(notification.type)
  const ctaText = notification.href ? getNotificationCtaText(notification.type) : null

  const handleClick = (e: React.MouseEvent) => {
    onClose?.()
    if (onOpenDetail) {
      e.preventDefault()
      onOpenDetail(notification)
      return
    }
    if (isUnread) {
      onMarkAsRead(notification.id)
    }
  }

  const content = (
    <div
      role={onOpenDetail ? "button" : undefined}
      className={cn(
        "flex gap-3 p-3 rounded-lg transition-colors cursor-pointer border border-transparent",
        isUnread ? "bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary" : "hover:bg-muted/50"
      )}
      onClick={handleClick}
    >
      <div className="shrink-0 mt-0.5">
        <Icon className="size-5 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium shrink-0", isUnread && "text-foreground")}>
            {notification.title}
          </p>
          {isUnread && (
            <div className="shrink-0 size-2 bg-primary rounded-full mt-1.5" aria-hidden />
          )}
        </div>

        {notification.body && (
          <p className="text-sm text-muted-foreground line-clamp-2">{notification.body}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="secondary" className="text-[10px] font-normal text-muted-foreground border-border">
            {label}
          </Badge>
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: tr })}
          </span>
        </div>

        {ctaText && notification.href && (
          <div className="flex items-center gap-1 text-xs text-primary pt-0.5">
            <span className="font-medium">{ctaText}</span>
            <ChevronRight className="size-3.5" />
          </div>
        )}
      </div>
    </div>
  )

  if (!onOpenDetail && notification.href) {
    return (
      <Link href={notification.href} className="block" onClick={onClose}>
        {content}
      </Link>
    )
  }

  return content
}
