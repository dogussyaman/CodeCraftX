"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface CvViewButtonProps {
  cvId: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  className?: string
  children?: React.ReactNode
}

export function CvViewButton({ cvId, size = "sm", variant = "outline", className, children }: CvViewButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/cv/signed-url?cv_id=${encodeURIComponent(cvId)}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) {
        toast.error(data.error || "CV açılamadı")
        return
      }
      window.open(data.url, "_blank", "noopener,noreferrer")
    } catch (e) {
      console.error(e)
      toast.error("CV açılamadı")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={loading}
    >
      {children ?? (
        <>
          <ExternalLink className="mr-2 size-4" />
          Görüntüle
        </>
      )}
    </Button>
  )
}
