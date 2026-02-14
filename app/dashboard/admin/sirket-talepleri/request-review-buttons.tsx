"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { updateCompanyRequestStatus } from "./actions"

export function RequestReviewButtons({ requestId }: { requestId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)

  async function handleReview(status: "approved" | "rejected") {
    setLoading(status === "approved" ? "approve" : "reject")
    const result = await updateCompanyRequestStatus(requestId, status)
    setLoading(null)
    if (result.ok) {
      toast({
        title: status === "approved" ? "Talep onaylandı" : "Talep reddedildi",
        description:
          status === "approved"
            ? "Şimdi \"Şirket oluştur\" ile şirketi ekleyebilirsiniz."
            : undefined,
      })
      router.refresh()
    } else {
      toast({
        title: "Hata",
        description: result.error ?? "İşlem yapılamadı",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="default"
        onClick={() => handleReview("approved")}
        disabled={loading !== null}
      >
        <Check className="h-4 w-4 mr-1" />
        {loading === "approve" ? "..." : "Onayla"}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleReview("rejected")}
        disabled={loading !== null}
      >
        <X className="h-4 w-4 mr-1" />
        {loading === "reject" ? "..." : "Reddet"}
      </Button>
    </div>
  )
}
