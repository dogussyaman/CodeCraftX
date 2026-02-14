"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"
import { createProjectJoinRequest } from "../actions"
import { toast } from "sonner"

interface ProjectJoinRequestButtonProps {
  projectId: string
  disabled?: boolean
  variant?: "default" | "primary" | "outline"
}

export function ProjectJoinRequestButton({ projectId, disabled, variant = "outline" }: ProjectJoinRequestButtonProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pending) return
    setPending(true)
    const result = await createProjectJoinRequest(projectId, message || null)
    if (result.ok) {
      toast.success("Katılma isteği gönderildi")
      setOpen(false)
      setMessage("")
    } else {
      toast.error(result.error ?? "Gönderilemedi")
    }
    setPending(false)
  }

  const buttonVariant = variant === "primary" ? "default" : variant

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className="gap-2" disabled={disabled}>
          <UserPlus className="size-4" />
          Katılma İsteği Gönder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Projeye katılma isteği</DialogTitle>
            <DialogDescription>
              Proje sahibine neden katılmak istediğinizi kısaca yazabilirsiniz (isteğe bağlı).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="join-message">Mesaj</Label>
              <Textarea
                id="join-message"
                placeholder="Deneyiminiz, motivasyonunuz..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              İptal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Gönderiliyor..." : "Gönder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
