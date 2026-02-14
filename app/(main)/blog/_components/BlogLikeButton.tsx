"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toggleBlogPostLike } from "../actions"
import { toast } from "sonner"

interface BlogLikeButtonProps {
  postId: string
  initialLikeCount: number
  initialHasLiked: boolean
  className?: string
}

export function BlogLikeButton({
  postId,
  initialLikeCount,
  initialHasLiked,
  className,
}: BlogLikeButtonProps) {
  const router = useRouter()
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [hasLiked, setHasLiked] = useState(initialHasLiked)
  const [isPending, setIsPending] = useState(false)

  async function handleToggle() {
    if (isPending) return
    setIsPending(true)
    const result = await toggleBlogPostLike(postId)
    setIsPending(false)
    if (result.ok && result.likeCount != null && result.liked !== undefined) {
      setLikeCount(result.likeCount)
      setHasLiked(result.liked)
      router.refresh()
    } else if (!result.ok && result.error) {
      toast.error(result.error)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className={`hover:bg-red-500/10 dark:hover:bg-red-500/20 ${className ?? ""}`}
      aria-label={hasLiked ? "Beğeniyi kaldır" : "Yazıyı beğen"}
      aria-pressed={hasLiked}
    >
      <Heart
        className={`size-4 shrink-0 ${hasLiked ? "fill-red-500 text-red-500" : "text-red-500"}`}
      />
      <span className="ml-1.5">{likeCount}</span>
    </Button>
  )
}
