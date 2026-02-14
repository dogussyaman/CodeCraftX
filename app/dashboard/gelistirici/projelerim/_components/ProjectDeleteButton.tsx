"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { deleteProject } from "../actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface ProjectDeleteButtonProps {
  projectId: string
  projectTitle: string
}

export function ProjectDeleteButton({ projectId, projectTitle }: ProjectDeleteButtonProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setPending(true)
    const result = await deleteProject(projectId)
    if (result.ok) {
      toast.success("Proje silindi")
      setOpen(false)
      router.refresh()
    } else {
      toast.error(result.error ?? "Silinemedi")
    }
    setPending(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive">
          <Trash2 className="size-3.5" />
          Sil
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Projeyi sil</AlertDialogTitle>
          <AlertDialogDescription>
            &quot;{projectTitle}&quot; projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>İptal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={pending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Sil
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
