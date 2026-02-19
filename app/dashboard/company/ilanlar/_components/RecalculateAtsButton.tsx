"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface RecalculateAtsButtonProps {
  jobId: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

export function RecalculateAtsButton({ jobId, className, variant = "outline", size = "sm" }: RecalculateAtsButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ats/recalculate-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        toast.error(data.error ?? "ATS skorları güncellenemedi")
        return
      }
      toast.success("ATS skorları yenilendi")
    } catch (e) {
      console.error(e)
      toast.error("İstek sırasında hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? <RefreshCw className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
      ATS Skorlarını Yenile
    </Button>
  )
}
