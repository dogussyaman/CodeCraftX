"use client"

import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { Bell, Briefcase, FileText, Mail, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import type { Notification } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface NotificationItemProps {
    notification: Notification
    onMarkAsRead: (id: string) => void
}

const getNotificationMeta = (type: string) => {
    switch (type) {
        case "new_application":
            return { label: "Yeni Başvuru", icon: Briefcase }
        case "application_status_changed":
            return { label: "Başvuru Durumu", icon: FileText }
        case "new_match":
            return { label: "Yeni Eşleşme", icon: CheckCircle2 }
        case "cv_processed":
            return { label: "CV İncelendi", icon: CheckCircle2 }
        case "cv_failed":
            return { label: "CV İşlenemedi", icon: XCircle }
        case "new_contact_message":
            return { label: "Yeni Mesaj", icon: Mail }
        case "system":
            return { label: "Sistem", icon: AlertCircle }
        default:
            return { label: "Genel", icon: Bell }
    }
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
    const isUnread = !notification.read_at
    const { label, icon: Icon } = getNotificationMeta(notification.type)

    const handleClick = () => {
        if (isUnread) {
            onMarkAsRead(notification.id)
        }
    }

    const content = (
        <div
            className={cn(
                "flex gap-3 p-3 rounded-lg transition-colors cursor-pointer border border-transparent",
                isUnread
                    ? "bg-primary/5 hover:bg-primary/10 border-l-2 border-primary"
                    : "hover:bg-muted/50"
            )}
            onClick={handleClick}
        >
            <div className="flex-shrink-0 mt-0.5">
                <Icon className="size-5 text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-wrap">
                        <p className={cn("text-sm font-medium", isUnread && "text-foreground")}>
                            {notification.title}
                        </p>
                        <Badge variant="outline" className="text-muted-foreground border-border">
                            {label}
                        </Badge>
                    </div>
                    {isUnread && (
                        <div className="flex-shrink-0 size-2 bg-primary rounded-full mt-1.5" />
                    )}
                </div>

                {notification.body && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.body}
                    </p>
                )}

                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                        {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: tr,
                        })}
                    </span>
                    {notification.href && (
                        <span className="text-[11px] text-muted-foreground/80">
                            Detayları görüntüle
                        </span>
                    )}
                </div>
            </div>
        </div>
    )

    if (notification.href) {
        return (
            <Link href={notification.href} className="block">
                {content}
            </Link>
        )
    }

    return content
}
