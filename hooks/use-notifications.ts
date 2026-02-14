"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Notification } from "@/lib/types"

export function useNotifications(userId: string | undefined) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    // Bildirimleri çek
    const fetchNotifications = async () => {
        if (!userId) {
            setNotifications([])
            setUnreadCount(0)
            setLoading(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("recipient_id", userId)
                .order("created_at", { ascending: false })
                .limit(50)

            if (error) throw error

            setNotifications(data || [])
            setUnreadCount((data || []).filter((n) => !n.read_at).length)
        } catch (error) {
            console.error("Bildirimler yüklenirken hata:", error)
        } finally {
            setLoading(false)
        }
    }

    // Bildirimi okundu olarak işaretle
    const markAsRead = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from("notifications")
                .update({ read_at: new Date().toISOString() })
                .eq("id", notificationId)
                .eq("recipient_id", userId)

            if (error) throw error

            // Local state'i güncelle
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
                )
            )
            setUnreadCount((prev) => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Bildirim okundu olarak işaretlenirken hata:", error)
        }
    }

    // Tüm bildirimleri okundu olarak işaretle
    const markAllAsRead = async () => {
        if (!userId) return

        try {
            const { error } = await supabase
                .from("notifications")
                .update({ read_at: new Date().toISOString() })
                .eq("recipient_id", userId)
                .is("read_at", null)

            if (error) throw error

            // Local state'i güncelle
            const now = new Date().toISOString()
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: n.read_at || now }))
            )
            setUnreadCount(0)
        } catch (error) {
            console.error("Tüm bildirimler okundu olarak işaretlenirken hata:", error)
        }
    }

    // İlk yükleme
    useEffect(() => {
        fetchNotifications()
    }, [userId])

    // Realtime subscription
    useEffect(() => {
        if (!userId) return

        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `recipient_id=eq.${userId}`,
                },
                (payload) => {
                    const newNotification = payload.new as Notification
                    setNotifications((prev) => [newNotification, ...prev])
                    setUnreadCount((prev) => prev + 1)
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "notifications",
                    filter: `recipient_id=eq.${userId}`,
                },
                (payload) => {
                    const updatedNotification = payload.new as Notification
                    setNotifications((prev) =>
                        prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
                    )
                    // Okunmamış sayısını yeniden hesapla
                    setNotifications((current) => {
                        setUnreadCount(current.filter((n) => !n.read_at).length)
                        return current
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refetch: fetchNotifications,
    }
}
