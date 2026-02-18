"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface AddToMatchesButtonProps {
  applicationId: string
  jobId: string
  developerId: string
  initiallyInMatches: boolean
}

export function AddToMatchesButton({
  applicationId,
  jobId,
  developerId,
  initiallyInMatches,
}: AddToMatchesButtonProps) {
  const [loading, setLoading] = useState(false)
  const [inMatches, setInMatches] = useState(initiallyInMatches)

  const handleClick = async () => {
    if (inMatches || loading) return
    setLoading(true)
    try {
      const res = await fetch("/api/applications/add-to-matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, jobId, developerId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        toast.error(data.error || "Eşleşmelere eklenemedi")
        return
      }
      setInMatches(true)
      toast.success("Aday eşleşmelere eklendi", {
        description: "Eşleşmeler sayfasından tüm uygun adayları görüntüleyebilirsiniz.",
      })
    } catch (error) {
      console.error(error)
      toast.error("Eşleşmelere eklenirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  const baseClass = "h-8 gap-1.5 rounded-lg text-xs font-medium shrink-0"
  if (inMatches) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled
        className={`${baseClass} border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400`}
      >
        <Star className="size-3.5" />
        Eşleşmelerde
      </Button>
    )
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={loading}
      className={baseClass}
    >
      <Sparkles className="size-3" />
      Eşleşmelere ekle
    </Button>
  )
}

