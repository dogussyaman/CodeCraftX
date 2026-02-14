"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, Upload } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface AvatarUploadProps {
    userId: string
    currentUrl?: string | null
    fullName: string
    onUploadComplete?: (url: string) => void
}

export function AvatarUpload({ userId, currentUrl, fullName, onUploadComplete }: AvatarUploadProps) {
    const [url, setUrl] = useState<string | null>(currentUrl || null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()

    async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
        try {
            setUploading(true)
            const file = event.target.files?.[0]
            if (!file) {
                return
            }

            // Dosya uzantısı kontrolü
            const fileExt = file.name.split(".").pop()
            const allowedExts = ["jpg", "jpeg", "png", "gif", "webp"]
            if (!fileExt || !allowedExts.includes(fileExt.toLowerCase())) {
                toast.error("Sadece resim dosyaları yüklenebilir.")
                return
            }

            // Dosya boyutu kontrolü (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Dosya boyutu 2MB'dan küçük olmalıdır.")
                return
            }

            const filePath = `${userId}/${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, { upsert: true })

            if (uploadError) {
                throw uploadError
            }

            // Public URL al
            const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath)

            // Profili güncelle
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ avatar_url: publicUrl })
                .eq("id", userId)

            if (updateError) {
                throw updateError
            }

            setUrl(publicUrl)
            if (onUploadComplete) onUploadComplete(publicUrl)
            toast.success("Profil fotoğrafı güncellendi")
            router.refresh()
        } catch (error: any) {
            console.error("Upload error:", error)
            toast.error("Fotoğraf yüklenirken bir hata oluştu: " + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault()
        fileInputRef.current?.click()
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                    <AvatarImage src={url || ""} alt={fullName} className="object-cover" />
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                        {fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={handleButtonClick}
                >
                    <Camera className="text-white size-8" />
                </div>
            </div>

            <div className="flex flex-col items-center">
                <input
                    type="file"
                    id="avatar-upload"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleButtonClick}
                    disabled={uploading}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Yükleniyor
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 size-4" />
                            Fotoğraf Değiştir
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
