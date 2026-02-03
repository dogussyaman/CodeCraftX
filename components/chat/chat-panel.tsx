"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { ChevronDown } from "lucide-react"
import { useChatParticipant } from "@/hooks/use-chat"
import { ChatConversationList } from "./chat-conversation-list"
import { ChatMessageList } from "./chat-message-list"
import { ChatMessageInput } from "./chat-message-input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ChatPanelProps {
  userId: string
  userAvatarUrl?: string
  userFullName?: string
}

const suggestions = [
  "Siparişim nerede?",
  "İade süreci nasıl işler?",
  "Teknik bir sorun yaşıyorum",
  "Fatura talep ediyorum",
  "Hesap ayarlarımı değiştirmek istiyorum",
]

export function ChatPanel({ userId, userAvatarUrl, userFullName }: ChatPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const prevLastIdRef = useRef<string | null>(null)

  const {
    conversations,
    messages,
    selectedConversationId,
    setSelectedConversationId,
    loadingConversations,
    loadingMessages,
    sending,
    createConversation,
    sendMessage,
  } = useChatParticipant(userId)

  // Yeni mesaj geldiğinde en alta kaydır (demo'daki gibi tek scroll container)
  useEffect(() => {
    const lastId = messages.length > 0 ? messages[messages.length - 1].id : null
    if (lastId != null && lastId !== prevLastIdRef.current) {
      const el = scrollContainerRef.current
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
      }
      prevLastIdRef.current = lastId
    }
    if (lastId == null) prevLastIdRef.current = null
  }, [messages])

  const checkScrollPosition = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const threshold = 80
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    setShowScrollButton(!nearBottom)
  }, [])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    checkScrollPosition()
    el.addEventListener("scroll", checkScrollPosition)
    const ro = new ResizeObserver(checkScrollPosition)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", checkScrollPosition)
      ro.disconnect()
    }
  }, [checkScrollPosition, messages.length])

  const scrollToBottom = () => {
    scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: "smooth" })
  }

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden rounded-lg border border-border bg-card">
      <div className="w-64 shrink-0 border-r border-border md:w-72">
        <ChatConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
          onCreateNew={createConversation}
          loading={loadingConversations}
          creating={sending}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col min-w-0 overflow-hidden">
        {selectedConversationId ? (
          <>
            {/* Header - shrink-0 */}
            <div className="shrink-0 border-b border-border px-4 py-2 flex items-center gap-3">
              <Avatar className="size-8 shrink-0 border border-border">
                <AvatarImage src={userAvatarUrl} alt={userFullName ?? ""} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {(userFullName ?? "Siz")
                    .split(" ")
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium text-muted-foreground">
                Canlı destek sohbeti — mesajlar anlık iletilir.
              </p>
            </div>

            {/* Conversation alanı: demo'daki gibi min-h-0 flex-1, tek scroll container */}
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden border-b border-border">
              <div
                ref={scrollContainerRef}
                className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
                role="region"
                aria-label="Sohbet mesajları"
              >
                <ChatMessageList
                  messages={messages}
                  currentUserId={userId}
                  loading={loadingMessages}
                  contentOnly
                  currentUserAvatarUrl={userAvatarUrl}
                  currentUserFullName={userFullName}
                />
              </div>
              {/* Scroll to bottom - demo'daki ConversationScrollButton gibi */}
              {showScrollButton && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="rounded-full shadow-md"
                    onClick={scrollToBottom}
                  >
                    <ChevronDown className="size-4" />
                    <span className="sr-only">En alta git</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Suggestions + Input - demo'daki gibi shrink-0 alan */}
            <div className="shrink-0 space-y-4 pt-4">
              <div className="flex flex-wrap gap-2 px-4">
                {suggestions.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={() => {
                      void sendMessage(s)
                    }}
                    disabled={sending || !selectedConversationId}
                  >
                    {s}
                  </Button>
                ))}
              </div>
              <div className="w-full px-4 pb-4">
                <ChatMessageInput
                  onSend={(content, urls) => sendMessage(content, urls)}
                  disabled={sending}
                  placeholder="Mesajınızı yazın..."
                  conversationId={selectedConversationId}
                  userId={userId}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
            <p className="text-sm">Sohbet seçin veya yeni sohbet başlatın.</p>
          </div>
        )}
      </div>
    </div>
  )
}
