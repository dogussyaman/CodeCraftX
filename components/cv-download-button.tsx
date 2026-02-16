"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

interface CvDownloadButtonProps {
  applicationId: string
  fileUrl: string
  fileName?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function CvDownloadButton({
  applicationId,
  fileUrl,
  fileName,
  variant = "outline",
  size = "sm",
  className,
}: CvDownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!applicationId) {
      toast.error("Başvuru bulunamadı")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/applications/cv-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || "Kayıt alınamadı")
        setLoading(false)
        return
      }
      const urlRes = await fetch(`/api/cv/signed-url?applicationId=${encodeURIComponent(applicationId)}`)
      const urlData = await urlRes.json().catch(() => ({}))
      if (!urlRes.ok || !urlData.url) {
        toast.error(urlData.error || "CV açılamadı")
        setLoading(false)
        return
      }
      window.open(urlData.url, "_blank", "noopener,noreferrer")
      toast.success("CV indirildi, aday bilgilendirilecek")
    } catch (e) {
      console.error(e)
      toast.error("İşlem başarısız")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={loading}
    >
      <Download className="size-4 mr-1.5" />
      {loading ? "Kaydediliyor..." : "CV İndir"}
    </Button>
  )
}
