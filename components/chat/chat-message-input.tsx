"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, ImagePlus, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const BUCKET = "chat-attachments"
const MAX_IMAGES = 5
const ACCEPT = "image/jpeg,image/png,image/gif,image/webp"

interface ChatMessageInputProps {
  onSend: (content: string, attachmentUrls?: string[]) => Promise<boolean>
  disabled?: boolean
  placeholder?: string
  conversationId: string | null
  userId: string
}

export function ChatMessageInput({
  onSend,
  disabled,
  placeholder = "Mesajınızı yazın...",
  conversationId,
  userId,
}: ChatMessageInputProps) {
  const [value, setValue] = useState("")
  const [sending, setSending] = useState(false)
  const [pendingUrls, setPendingUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const uploadImages = useCallback(
    async (files: File[]): Promise<string[]> => {
      if (!conversationId || files.length === 0) return []
      const urls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
        const path = `${conversationId}/${userId}/${crypto.randomUUID()}.${ext}`
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        })
        if (error) {
          console.error("Chat attachment upload error:", error)
          continue
        }
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
        urls.push(data.publicUrl)
      }
      return urls
    },
    [conversationId, userId]
  )

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : []
      if (files.length === 0) return
      const imageFiles = files.filter((f) => f.type.startsWith("image/")).slice(0, MAX_IMAGES - pendingUrls.length)
      if (imageFiles.length === 0) return
      setUploading(true)
      try {
        const urls = await uploadImages(imageFiles)
        setPendingUrls((prev) => [...prev, ...urls].slice(0, MAX_IMAGES))
      } finally {
        setUploading(false)
        e.target.value = ""
      }
    },
    [pendingUrls.length, uploadImages]
  )

  const removePending = useCallback((index: number) => {
    setPendingUrls((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim()
    const hasContent = trimmed.length > 0
    const hasAttachments = pendingUrls.length > 0
    if ((!hasContent && !hasAttachments) || disabled || sending) return
    setSending(true)
    try {
      const ok = await onSend(trimmed || " ", pendingUrls.length > 0 ? pendingUrls : undefined)
      if (ok) {
        setValue("")
        setPendingUrls([])
      }
    } finally {
      setSending(false)
    }
  }, [value, pendingUrls, disabled, sending, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit()
    }
  }

  const canSend = (value.trim().length > 0 || pendingUrls.length > 0) && !disabled && !sending

  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-background p-3">
      {pendingUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pendingUrls.map((url, i) => (
            <div key={url} className="relative">
              <img
                src={url}
                alt=""
                className="h-14 w-14 rounded object-cover ring-1 ring-border"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute -right-1 -top-1 size-5 rounded-full"
                onClick={() => removePending(i)}
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || sending || uploading || !conversationId || pendingUrls.length >= MAX_IMAGES}
          title="Resim ekle"
        >
          <ImagePlus className="size-4" />
        </Button>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || sending}
          rows={1}
          className="min-h-[40px] max-h-32 flex-1 resize-none"
        />
        <Button
          type="button"
          size="icon"
          onClick={handleSubmit}
          disabled={!canSend}
          className="shrink-0"
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}
