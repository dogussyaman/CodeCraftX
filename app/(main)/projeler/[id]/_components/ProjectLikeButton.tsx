"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toggleProjectLike } from "../actions"

interface ProjectLikeButtonProps {
  projectId: string
  initialLiked: boolean
  initialCount: number
}

export function ProjectLikeButton({ projectId, initialLiked, initialCount }: ProjectLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [pending, setPending] = useState(false)

  async function handleClick() {
    if (pending) return
    setPending(true)
    const prevLiked = liked
    const prevCount = count
    setLiked(!liked)
    setCount((c) => (liked ? c - 1 : c + 1))
    const result = await toggleProjectLike(projectId)
    if (!result.ok) {
      setLiked(prevLiked)
      setCount(prevCount)
    }
    setPending(false)
  }

  return (
    <Button
      variant="outline"
      className={`gap-2 ${liked ? "border-primary bg-primary/10 text-primary" : "bg-transparent"}`}
      onClick={handleClick}
      disabled={pending}
    >
      <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
      {liked ? "Beğenildi" : "Beğen"} ({count})
    </Button>
  )
}
