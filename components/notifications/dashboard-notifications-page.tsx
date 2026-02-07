"use client"

import { useEffect, useState } from "react"
import { Bell, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NotificationItem } from "@/components/notifications/notification-item"
import { NotificationDetailSheet } from "@/components/notifications/notification-detail-sheet"
import { NotificationListSkeleton } from "@/components/skeleton-loaders"
import { useNotifications } from "@/hooks/use-notifications"
import type { Notification } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

const DEFAULT_SUBTITLE = "Tüm bildirimlerinizi buradan görüntüleyebilirsiniz"

interface DashboardNotificationsPageProps {
  subtitle?: string
  /** Server'dan geçirilirse client'ta getUser beklemez, yükleme hızlanır */
  userId?: string
  /** Parent sayfa kendi header'ını kullanıyorsa true (company/ik bildirimler) */
  hideHeader?: boolean
}

export function DashboardNotificationsPage({ subtitle = DEFAULT_SUBTITLE, userId: userIdProp, hideHeader }: DashboardNotificationsPageProps) {
  const [user, setUser] = useState<User | null>(null)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const supabase = createClient()

  const userId = userIdProp ?? user?.id

  useEffect(() => {
    if (userIdProp) return
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [userIdProp])

  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications(userId)
  const [detailNotification, setDetailNotification] = useState<Notification | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleOpenDetail = (n: Notification) => {
    setDetailNotification(n)
    setDetailOpen(true)
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read_at
    if (filter === "read") return !!n.read_at
    return true
  })

  const content = (
    <>
      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tüm Bildirimler</CardTitle>
              <CardDescription>{filteredNotifications.length} bildirim</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={filter} onValueChange={(v: "all" | "unread" | "read") => setFilter(v)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="size-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="unread">Okunmamış</SelectItem>
                  <SelectItem value="read">Okunmuş</SelectItem>
                </SelectContent>
              </Select>
              {notifications.some((n) => !n.read_at) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  Tümünü okundu işaretle
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <NotificationListSkeleton rows={6} />
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="size-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {filter === "unread"
                  ? "Okunmamış bildiriminiz yok"
                  : filter === "read"
                    ? "Okunmuş bildiriminiz yok"
                    : "Henüz bildiriminiz yok"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onOpenDetail={handleOpenDetail}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NotificationDetailSheet
        notification={detailNotification}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onMarkAsRead={markAsRead}
      />
    </>
  )

  if (hideHeader) {
    return content
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell className="size-8 text-primary" />
          Bildirimler
        </h1>
        <p className="text-muted-foreground mt-2">{subtitle}</p>
      </div>
      {content}
    </div>
  )
}
