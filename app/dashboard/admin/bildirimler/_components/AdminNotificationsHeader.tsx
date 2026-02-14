"use client"

import { Bell, Megaphone } from "lucide-react"

export function AdminNotificationsHeader() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-primary/10 px-6 py-8 shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_70%_-20%,rgba(var(--primary),0.08),transparent)] pointer-events-none" />
      <div className="relative flex items-start gap-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary shadow-inner">
          <Megaphone className="size-7" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Toplu Bildirim Gönder
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground leading-relaxed">
            Tüm kullanıcılara veya belirli rollere{" "}
            <span className="font-medium text-foreground">platform içi bildirim</span> gönderin.
            Bu ekran e-posta göndermez; sadece kullanıcıların{" "}
            <Bell className="inline size-3.5 text-muted-foreground" /> bildirim merkezinde
            göreceği kayıtlar oluşturulur.
          </p>
        </div>
      </div>
    </div>
  )
}
