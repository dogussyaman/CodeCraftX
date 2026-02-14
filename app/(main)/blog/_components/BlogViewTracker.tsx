"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { incrementBlogPostView } from "../actions"

interface BlogViewTrackerProps {
  postId: string
}

export function BlogViewTracker({ postId }: BlogViewTrackerProps) {
  const router = useRouter()
  const didIncrementRef = useRef(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (didIncrementRef.current) return
    didIncrementRef.current = true

    incrementBlogPostView(postId).then((result) => {
      if (result?.ok) {
        router.refresh()
      } else if (result?.error) {
        console.error("Blog view increment failed:", result.error)
        toast.error("Görüntülenme sayılamadı. Lütfen daha sonra tekrar deneyin.")
      }
    })
  }, [postId, router])

  return null
}
