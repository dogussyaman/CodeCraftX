"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import { toast } from "sonner"

interface AssignApplicationToMeButtonProps {
  applicationId: string
  alreadyAssigned?: boolean
}

export function AssignApplicationToMeButton({
  applicationId,
  alreadyAssigned = false,
}: AssignApplicationToMeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [assigned, setAssigned] = useState(alreadyAssigned)
  const supabase = createClient()

  const handleAssign = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Oturum bulunamadı")
        setLoading(false)
        return
      }
      const { error } = await supabase.from("application_assignments").insert({
        application_id: applicationId,
        assigned_to: user.id,
        assigned_by: user.id,
        status: "active",
      })
      if (error) {
        if (error.code === "23505") {
          setAssigned(true)
          toast.success("Bu başvuru zaten size atanmış")
        } else {
          toast.error(error.message || "Atama yapılamadı")
        }
        setLoading(false)
        return
      }
      setAssigned(true)
      toast.success("Başvuru size atandı")
    } catch (e) {
      console.error(e)
      toast.error("İşlem başarısız")
    } finally {
      setLoading(false)
    }
  }

  if (assigned) return null

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-xs"
      onClick={handleAssign}
      disabled={loading}
    >
      <UserPlus className="size-3.5 mr-1" />
      {loading ? "Atanıyor..." : "Bu başvuruyu üstlen"}
    </Button>
  )
}
