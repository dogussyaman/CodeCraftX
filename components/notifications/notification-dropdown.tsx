"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationItem } from "./notification-item"
import { NotificationDropdownSkeleton } from "@/components/skeleton-loaders"
import { useNotifications } from "@/hooks/use-notifications"
import Link from "next/link"

interface NotificationDropdownProps {
    userId: string
    dashboardPath: string
}

export function NotificationDropdown({ userId, dashboardPath }: NotificationDropdownProps) {
    const [open, setOpen] = useState(false)
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(userId)

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-primary/10 hover:text-primary transition-colors"
                >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 size-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[380px] p-0">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-sm">Bildirimler</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-8 text-xs hover:bg-primary/10 hover:text-primary"
                        >
                            Tümünü okundu işaretle
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <NotificationDropdownSkeleton />
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="size-12 mx-auto mb-3 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">Henüz bildiriminiz yok</p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {notifications.slice(0, 10).map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={markAsRead}
                                    onClose={() => setOpen(false)}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                            <Button
                                variant="ghost"
                                asChild
                                className="w-full justify-center text-sm hover:bg-primary/10 hover:text-primary"
                            >
                                <Link href={`${dashboardPath}/bildirimler`} onClick={() => setOpen(false)}>
                                    Tüm bildirimleri gör
                                </Link>
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
