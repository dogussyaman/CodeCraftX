"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { MessageCirclePlus } from "lucide-react"
import type { ChatConversation } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

const statusLabels: Record<string, string> = {
  open: "Açık",
  in_progress: "İşlemde",
  closed: "Kapatıldı",
}

interface ChatConversationListProps {
  conversations: ChatConversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  onCreateNew: () => void
  loading: boolean
  creating: boolean
}

export function ChatConversationList({
  conversations,
  selectedId,
  onSelect,
  onCreateNew,
  loading,
  creating,
}: ChatConversationListProps) {
  return (
    <div className="flex h-full flex-col border-r border-border bg-muted/30">
      <div className="flex shrink-0 items-center justify-between border-b border-border p-3">
        <span className="text-sm font-medium">Sohbetler</span>
        <Button
          size="sm"
          variant="outline"
          onClick={onCreateNew}
          disabled={creating || loading}
          className="gap-1.5"
        >
          <MessageCirclePlus className="size-4" />
          Yeni
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {loading && conversations.length === 0 ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Henüz sohbet yok. Yeni sohbet başlatın.
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={cn(
                  "flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted",
                  selectedId === c.id && "bg-muted"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">
                    {c.mt_user_id ? "Destek" : "Beklemede"}
                  </span>
                  <Badge variant={c.status === "closed" ? "secondary" : "default"} className="shrink-0 text-xs">
                    {statusLabels[c.status] ?? c.status}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(c.updated_at), { addSuffix: true, locale: tr })}
                </span>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
