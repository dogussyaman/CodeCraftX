"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface BackgroundUploadProps {
    userId: string
    currentUrl?: string | null
    onUploadComplete?: (url: string) => void
}

export function BackgroundUpload({ userId, currentUrl, onUploadComplete }: BackgroundUploadProps) {
    const [url, setUrl] = useState<string | null>(currentUrl || null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()

    async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
        try {
            setUploading(true)
            const file = event.target.files?.[0]
            if (!file) return

            // Dosya uzantısı kontrolü
            const fileExt = file.name.split(".").pop()
            const allowedExts = ["jpg", "jpeg", "png", "gif", "webp"]
            if (!fileExt || !allowedExts.includes(fileExt.toLowerCase())) {
                toast.error("Sadece resim dosyaları yüklenebilir.")
                return
            }

            // Dosya boyutu kontrolü (max 5MB - banner için biraz daha büyük olabilir)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Dosya boyutu 5MB'dan küçük olmalıdır.")
                return
            }

            const filePath = `${userId}/bg-${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from("avatars") // Aynı bucket'ı kullanıyoruz
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath)

            const { error: updateError } = await supabase
                .from("profiles")
                .update({ profile_bg_url: publicUrl })
                .eq("id", userId)

            if (updateError) throw updateError

            setUrl(publicUrl)
            if (onUploadComplete) onUploadComplete(publicUrl)
            toast.success("Kapak fotoğrafı güncellendi")
            router.refresh()
        } catch (error: any) {
            console.error("Upload error:", error)
            toast.error("Fotoğraf yüklenirken bir hata oluştu")
        } finally {
            setUploading(false)
        }
    }

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className="relative group w-full h-48 bg-muted rounded-xl overflow-hidden border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors">
            {url ? (
                <>
                    <img
                        src={url}
                        alt="Profile Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button variant="secondary" size="sm" onClick={handleButtonClick}>
                            <Camera className="mr-2 size-4" />
                            Değiştir
                        </Button>
                    </div>
                </>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer" onClick={handleButtonClick}>
                    <Upload className="size-8 mb-2" />
                    <span className="text-sm font-medium">Kapak Fotoğrafı Yükle</span>
                    <span className="text-xs opacity-70">1920x300 px önerilir</span>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={uploadImage}
                disabled={uploading}
            />

            {uploading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <Loader2 className="size-8 animate-spin text-primary" />
                </div>
            )}
        </div>
    )
}
