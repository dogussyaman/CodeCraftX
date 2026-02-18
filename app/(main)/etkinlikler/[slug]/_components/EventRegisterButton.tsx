"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { registerForEvent, unregisterFromEvent } from "../../actions"
import { toast } from "sonner"
import { Loader2, UserPlus, UserMinus } from "lucide-react"

interface EventRegisterButtonProps {
  eventId: string
  isRegistered: boolean
  canRegister: boolean
  cannotRegisterReason: string | null
  isLoggedIn: boolean
}

export function EventRegisterButton({
  eventId,
  isRegistered,
  canRegister,
  cannotRegisterReason,
  isLoggedIn,
}: EventRegisterButtonProps) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  if (!isLoggedIn) {
    return (
      <Button asChild size="lg" className="gap-2">
        <Link href="/auth/giris?redirect=/etkinlikler">
          Giriş yaparak kayıt olun
        </Link>
      </Button>
    )
  }

  if (isRegistered) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Bu etkinliğe kayıtlısınız</span>
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={async () => {
            setPending(true)
            const res = await unregisterFromEvent(eventId)
            setPending(false)
            if (res.ok) {
              toast.success("Kayıt iptal edildi")
              router.refresh()
            } else {
              toast.error(res.error)
            }
          }}
          className="gap-1"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <UserMinus className="size-4" />}
          Kaydı iptal et
        </Button>
      </div>
    )
  }

  if (!canRegister) {
    return (
      <p className="text-sm text-muted-foreground">
        {cannotRegisterReason ?? "Bu etkinliğe kayıt olamazsınız."}
      </p>
    )
  }

  return (
    <Button
      size="lg"
      className="gap-2"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        const res = await registerForEvent(eventId)
        setPending(false)
        if (res.ok) {
          toast.success("Kayıt başarılı")
          router.refresh()
        } else {
          toast.error(res.error)
        }
      }}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
      Etkinliğe kayıt ol
    </Button>
  )
}
