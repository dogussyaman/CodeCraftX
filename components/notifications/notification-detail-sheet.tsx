"use client"

import { useEffect } from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import type { Notification } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { getNotificationTypeMeta, getNotificationCtaText } from "@/lib/notifications"

interface NotificationDetailSheetProps {
  notification: Notification | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onMarkAsRead?: (id: string) => void
}

export function NotificationDetailSheet({
  notification,
  open,
  onOpenChange,
  onMarkAsRead,
}: NotificationDetailSheetProps) {
  const isUnread = notification && !notification.read_at

  useEffect(() => {
    if (open && isUnread && onMarkAsRead && notification) {
      onMarkAsRead(notification.id)
    }
  }, [open, isUnread, notification?.id, onMarkAsRead])

  if (!notification) return null

  const { label, icon: Icon } = getNotificationTypeMeta(notification.type)
  const ctaText = notification.href ? getNotificationCtaText(notification.type) : null

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex flex-col sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <SheetTitle className="text-left text-base leading-tight">
                {notification.title}
              </SheetTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-xs font-normal text-muted-foreground border-border"
                >
                  {label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(notification.created_at), "d MMMM yyyy, HH:mm", { locale: tr })}
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {notification.body ? (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notification.body}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">İçerik yok.</p>
          )}
        </div>

        <SheetFooter className="border-t pt-4 flex-row gap-2 sm:gap-2">
          {notification.href && ctaText ? (
            <Button asChild className="gap-1.5">
              <Link href={notification.href} onClick={() => handleOpenChange(false)}>
                {ctaText}
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Kapat
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
