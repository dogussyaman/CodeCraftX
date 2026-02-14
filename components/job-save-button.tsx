"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck, Loader2, LogIn } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Link from "next/link"

interface JobSaveButtonProps {
  jobId: string
  initialSaved?: boolean
  isAuthenticated?: boolean
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
  className?: string
  onSavedChange?: (saved: boolean) => void
}

export function JobSaveButton({
  jobId,
  initialSaved = false,
  isAuthenticated = false,
  variant = "outline",
  size = "default",
  className,
  onSavedChange,
}: JobSaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  if (!isAuthenticated) {
    return (
      <Button variant={variant} size={size} className={className} asChild>
        <Link href="/auth/giris">
          <Bookmark className="size-4 mr-2" />
          Giriş Yap ve Kaydet
        </Link>
      </Button>
    )
  }

  const handleToggle = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (saved) {
        const { error } = await supabase
          .from("saved_jobs")
          .delete()
          .eq("developer_id", user.id)
          .eq("job_id", jobId)
        if (error) throw error
        setSaved(false)
        onSavedChange?.(false)
        toast.success("İlan kaydedilenlerden çıkarıldı")
      } else {
        const { error } = await supabase.from("saved_jobs").insert({
          developer_id: user.id,
          job_id: jobId,
        })
        if (error) {
          if (error.code === "23505") {
            setSaved(true)
            onSavedChange?.(true)
            return
          }
          throw error
        }
        setSaved(true)
        onSavedChange?.(true)
        toast.success("İlan kaydedildi")
      }
    } catch (err) {
      console.error("Save job error:", err)
      toast.error("İşlem başarısız")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin mr-2" />
      ) : saved ? (
        <BookmarkCheck className="size-4 mr-2 text-primary" />
      ) : (
        <Bookmark className="size-4 mr-2" />
      )}
      {saved ? "Kaydedildi" : "Kaydet"}
    </Button>
  )
}
