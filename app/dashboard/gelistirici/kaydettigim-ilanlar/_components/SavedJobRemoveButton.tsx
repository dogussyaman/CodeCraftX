"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookmarkCheck, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface SavedJobRemoveButtonProps {
  savedJobId: string
  jobId: string
}

export function SavedJobRemoveButton({ savedJobId, jobId }: SavedJobRemoveButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRemove = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.from("saved_jobs").delete().eq("id", savedJobId)
      if (error) throw error
      toast.success("İlan kaydedilenlerden çıkarıldı")
      router.refresh()
    } catch {
      toast.error("Kaldırılamadı")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground shrink-0"
      onClick={handleRemove}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <>
          <BookmarkCheck className="size-4 mr-1" />
          Kaldır
        </>
      )}
    </Button>
  )
}
