"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
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
import { toast } from "sonner"

interface CVDeleteButtonProps {
  cvId: string
  fileUrl: string
  status?: string
}

export function CVDeleteButton({ cvId, fileUrl, status }: CVDeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    try {
      setLoading(true)

      // Storage'dan dosyayı sil — file_url path (uuid/file.pdf) veya eski tam URL olabilir
      const filePath = fileUrl.startsWith("http") && fileUrl.includes("/cvs/")
        ? fileUrl.split("/cvs/")[1]
        : fileUrl
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from("cvs")
          .remove([filePath.trim()])

        if (storageError) {
          console.warn("Storage delete error (continuing anyway):", storageError)
          // Storage hatası olsa bile devam et, DB'den sil
        }
      }

      // Veritabanından CV'yi sil (cascade ile cv_profiles da silinecek)
      const { error: dbError } = await supabase.from("cvs").delete().eq("id", cvId)

      if (dbError) throw dbError

      toast.success("CV başarıyla silindi")
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("CV delete error:", error)
      toast.error("CV silinirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-destructive hover:text-destructive"
          disabled={loading}
        >
          <Trash2 className="mr-2 size-4" />
          Sil
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>CV'yi silmek istediğinize emin misiniz?</AlertDialogTitle>
          <AlertDialogDescription>
            Bu işlem geri alınamaz. CV dosyası ve tüm ilişkili veriler (CV profili, skills vb.) kalıcı olarak silinecektir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>İptal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Siliniyor...
              </>
            ) : (
              "Sil"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
