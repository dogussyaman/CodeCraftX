"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { addBlogComment } from "../actions"
import { toast } from "sonner"

interface BlogCommentFormProps {
  postId: string
  parentId?: string | null
  onSuccess?: () => void
}

export function BlogCommentForm({ postId, parentId = null, onSuccess }: BlogCommentFormProps) {
  const router = useRouter()
  const [body, setBody] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pending || !body.trim()) return
    setPending(true)
    const result = await addBlogComment(postId, body, parentId ?? undefined)
    if (result.ok) {
      toast.success("Yorumunuz eklendi")
      setBody("")
      router.refresh()
      onSuccess?.()
    } else {
      toast.error(result.error ?? "Gönderilemedi")
    }
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label htmlFor="comment-body">{parentId ? "Yanıtla" : "Yorum yaz"}</Label>
      <Textarea
        id="comment-body"
        placeholder={parentId ? "Yanıtınızı yazın..." : "Düşüncenizi paylaşın..."}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        required
        minLength={2}
        className="resize-none"
      />
      <Button type="submit" disabled={pending || !body.trim()}>
        {pending ? "Gönderiliyor..." : "Gönder"}
      </Button>
    </form>
  )
}
