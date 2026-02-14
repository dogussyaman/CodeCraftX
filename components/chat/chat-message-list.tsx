"use client"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ChatMessage } from "@/lib/types"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface ChatMessageListProps {
  messages: ChatMessage[]
  currentUserId: string
  loading?: boolean
  /** Scroll container parent'ta; sadece içerik render edilir (scroll sorununu önlemek için) */
  contentOnly?: boolean
  /** Profil fotoğrafı ve adı — kullanıcının kendi mesajlarında gösterilir */
  currentUserAvatarUrl?: string
  currentUserFullName?: string
}

export function ChatMessageList({ messages, currentUserId, loading, contentOnly, currentUserAvatarUrl, currentUserFullName }: ChatMessageListProps) {
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="space-y-3 w-full max-w-md">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="size-8 shrink-0 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
        <p className="text-sm">Henüz mesaj yok.</p>
        <p className="text-xs">İlk mesajı siz yazın veya destek ekibinin yanıtlamasını bekleyin.</p>
      </div>
    )
  }

  const content = (
    <div className={cn("flex flex-col gap-4 p-4", !contentOnly && "h-full min-h-0 flex-1")}>
      {messages.map((m) => {
          const isOwn = m.sender_id === currentUserId
          return (
            <div
              key={m.id}
              className={cn("flex gap-3", isOwn && "flex-row-reverse")}
            >
              <Avatar className="size-8 shrink-0">
                {isOwn ? (
                  <>
                    <AvatarImage src={currentUserAvatarUrl} alt={currentUserFullName ?? ""} className="object-cover" />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {(currentUserFullName ?? "Siz")
                        .split(" ")
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </>
                ) : (
                  <AvatarFallback className="text-xs">
                    <img src="/logo.png" alt="CodeCraftX" className="size-4" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div
                className={cn(
                  "flex max-w-[80%] flex-col gap-0.5 rounded-lg px-3 py-2",
                  isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                {m.content.trim() ? (
                  <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                ) : null}
                {m.attachment_urls?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {m.attachment_urls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded"
                      >
                        <img
                          src={url}
                          alt=""
                          className="max-h-48 max-w-full object-contain"
                        />
                      </a>
                    ))}
                  </div>
                ) : null}
                <span
                  className={cn(
                    "text-xs",
                    isOwn ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}
                >
                  {format(new Date(m.created_at), "d MMM HH:mm", { locale: tr })}
                </span>
              </div>
            </div>
          )
        })}
    </div>
  )
  return content
}
