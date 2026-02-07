"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BackLink } from "@/components/ui/back-link"
import { Upload, FileText, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function UploadCVPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Dosya boyutu kontrolü (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("Dosya boyutu 5MB'dan küçük olmalıdır")
        setFile(null)
        return
      }

      // Dosya tipi kontrolü
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Sadece PDF, DOC ve DOCX formatları desteklenmektedir")
        setFile(null)
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Kullanıcı bulunamadı")

      // Dosya adını oluştur (benzersiz)
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      // NOT: filePath'te bucket adı (cvs) olmamalı, Supabase otomatik ekliyor
      const filePath = fileName

      // Supabase Storage'a yükle
      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        // Eğer bucket yoksa kullanıcıya bilgi ver
        if (uploadError.message.includes("Bucket not found")) {
          throw new Error(
            "CV storage bucket'ı henüz oluşturulmamış. Lütfen Supabase dashboard'dan 'cvs' bucket'ını oluşturun."
          )
        }
        throw uploadError
      }

      // Public URL al (veya signed URL - güvenlik için)
      const {
        data: { publicUrl },
      } = supabase.storage.from("cvs").getPublicUrl(filePath)

      // CV kaydını veritabanına ekle
      const { data: cvData, error: dbError } = await supabase
        .from("cvs")
        .insert({
          developer_id: user.id,
          file_url: publicUrl,
          file_name: file.name,
          status: "pending",
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Edge Function'ı tetikle (CV processing için)
      // Not: Edge Function henüz oluşturulmadıysa bu adım atlanır
      try {
        const { error: functionError } = await supabase.functions.invoke("cv-process", {
          body: { cv_id: cvData.id },
        })

        if (functionError) {
          console.warn("Edge Function tetiklenemedi:", functionError)
          // Hata olsa bile devam et, CV kaydedildi
        }
      } catch (functionErr) {
        console.warn("Edge Function çağrısı başarısız:", functionErr)
        // Hata olsa bile devam et
      }

      router.push("/dashboard/gelistirici/cv")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme sırasında bir hata oluştu")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl min-h-screen">
      <div className="mb-6">
        <BackLink href="/dashboard/gelistirici/cv" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">CV Yükle</CardTitle>
          <CardDescription>Yeteneklerinizin analiz edilmesi için CV'nizi yükleyin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cv-file">CV Dosyası</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <div className="flex flex-col items-center">
                {file ? (
                  <>
                    <FileText className="size-12 text-primary mb-4" />
                    <p className="font-medium text-foreground mb-1">{file.name}</p>
                    <p className="text-sm text-muted-foreground mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                      Değiştir
                    </Button>
                  </>
                ) : (
                  <>
                    <Upload className="size-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      PDF, DOC veya DOCX formatında CV yükleyin
                      <br />
                      Maksimum dosya boyutu: 5MB
                    </p>
                    <Label htmlFor="cv-file" className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>Dosya Seç</span>
                      </Button>
                    </Label>
                    <Input
                      id="cv-file"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">CV Hazırlama İpuçları:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Yeteneklerinizi net bir şekilde belirtin</li>
              <li>• Deneyim yıllarınızı ekleyin</li>
              <li>• Eğitim ve sertifikalarınızı dahil edin</li>
              <li>• İletişim bilgilerinizi güncel tutun</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleUpload} disabled={!file || uploading} className="flex-1">
              {uploading ? "Yükleniyor..." : "CV'yi Yükle"}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/gelistirici/cv">İptal</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
