"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, AlertCircle, Loader2, CheckCircle2, User, Briefcase } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

type ParsedData = {
  skills?: string[]
  experience_years?: number
  roles?: string[]
  seniority?: string
  summary?: string
}

type AnalysisResult = {
  parsed_data: ParsedData | null
  cv_profile: { skills?: string[]; summary?: string; roles?: string[]; seniority?: string } | null
}

export default function UploadCVPage() {
  const [file, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<"form" | "uploading" | "analyzing" | "result" | "error">("form")
  const [error, setError] = useState<string | null>(null)
  const [resultData, setResultData] = useState<AnalysisResult | null>(null)
  const [cvId, setCvId] = useState<string | null>(null)
  const [applyingSkills, setApplyingSkills] = useState(false)
  const [appliedBio, setAppliedBio] = useState(false)
  const [appliedTitle, setAppliedTitle] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("Dosya boyutu 5MB'dan küçük olmalıdır")
        setFile(null)
        return
      }
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

    setPhase("uploading")
    setError(null)

    const supabase = createClient()
    let uploadedFilePath: string | null = null
    let createdCvId: string | null = null

    const cleanupOnError = async () => {
      try {
        // Storage'daki dosyayı sil
        if (uploadedFilePath) {
          const path =
            uploadedFilePath.startsWith("http") && uploadedFilePath.includes("/cvs/")
              ? uploadedFilePath.split("/cvs/")[1] ?? ""
              : uploadedFilePath

          if (path.trim().length > 0) {
            const { error: storageError } = await supabase.storage
              .from("cvs")
              .remove([path.trim()])

            if (storageError) {
              console.warn("CV upload cleanup storage error:", storageError)
            }
          }
        }

        // Veritabanındaki CV kaydını sil
        if (createdCvId) {
          const { error: dbError } = await supabase.from("cvs").delete().eq("id", createdCvId)
          if (dbError) {
            console.warn("CV upload cleanup DB error:", dbError)
          }
        }
      } catch (cleanupErr) {
        console.error("CV upload cleanup unexpected error:", cleanupErr)
      }
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Kullanıcı bulunamadı")

      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const filePath = fileName
      uploadedFilePath = filePath

      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(filePath, file, { cacheControl: "3600", upsert: false })

      if (uploadError) {
        if (uploadError.message.includes("Bucket not found")) {
          throw new Error(
            "CV storage bucket'ı henüz oluşturulmamış. Lütfen Supabase dashboard'dan 'cvs' bucket'ını oluşturun."
          )
        }
        throw uploadError
      }

      // Store storage path (private bucket: use signed URL via /api/cv/signed-url for viewing)
      const { data: cvData, error: dbError } = await supabase
        .from("cvs")
        .insert({
          developer_id: user.id,
          file_url: filePath,
          file_name: file.name,
          status: "pending",
        })
        .select()
        .single()

      if (dbError || !cvData) {
        throw dbError || new Error("CV kaydı oluşturulamadı")
      }

      createdCvId = cvData.id

      setCvId(cvData.id)
      setPhase("analyzing")

      const res = await fetch("/api/cv/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_id: cvData.id }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        await cleanupOnError()
        setError(data.error || "Analiz tamamlanamadı")
        setPhase("error")
        return
      }

      if (data.status === "failed") {
        await cleanupOnError()
        setError("CV analizi başarısız oldu.")
        setPhase("error")
        return
      }

      setResultData({
        parsed_data: data.parsed_data ?? null,
        cv_profile: data.cv_profile ?? null,
      })
      setPhase("result")
      toast.success("CV analiz edildi. Önerileri profilize ekleyebilirsiniz.")
    } catch (err) {
      await cleanupOnError()
      setError(err instanceof Error ? err.message : "Yükleme sırasında bir hata oluştu")
      setPhase("error")
    }
  }

  const handleApplySkills = async () => {
    if (!cvId) return
    setApplyingSkills(true)
    try {
      const res = await fetch("/api/profile/apply-cv-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_id: cvId }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        toast.success(`${data.count ?? 0} yetenek profilize eklendi`)
        setApplyingSkills(false)
        return
      }
      toast.error(data.error || "Yetenekler eklenemedi")
    } catch {
      toast.error("İşlem başarısız")
    } finally {
      setApplyingSkills(false)
    }
  }

  const handleApplyBio = async () => {
    const summary =
      resultData?.parsed_data?.summary ??
      resultData?.cv_profile?.summary ??
      ""
    if (!summary) return
    try {
      const res = await fetch("/api/profile/update-bio-title", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: summary }),
      })
      if (res.ok) {
        toast.success("Hakkımda profilize eklendi")
        setAppliedBio(true)
        return
      }
      toast.error("Güncellenemedi")
    } catch {
      toast.error("İşlem başarısız")
    }
  }

  const handleApplyTitle = async () => {
    const title =
      resultData?.parsed_data?.roles?.[0] ??
      resultData?.cv_profile?.roles?.[0] ??
      (resultData?.parsed_data?.seniority || resultData?.cv_profile?.seniority
        ? `${resultData?.parsed_data?.seniority || resultData?.cv_profile?.seniority} Developer`
        : "")
    if (!title) return
    try {
      const res = await fetch("/api/profile/update-bio-title", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
      if (res.ok) {
        toast.success("Unvan profilize eklendi")
        setAppliedTitle(true)
        return
      }
      toast.error("Güncellenemedi")
    } catch {
      toast.error("İşlem başarısız")
    }
  }

  const skills =
    resultData?.parsed_data?.skills ??
    resultData?.cv_profile?.skills ??
    []
  const summary =
    resultData?.parsed_data?.summary ??
    resultData?.cv_profile?.summary ??
    ""
  const suggestedTitle =
    resultData?.parsed_data?.roles?.[0] ??
    resultData?.cv_profile?.roles?.[0] ??
    (resultData?.parsed_data?.seniority || resultData?.cv_profile?.seniority
      ? `${resultData?.parsed_data?.seniority || resultData?.cv_profile?.seniority} Developer`
      : "")

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl min-h-screen">
      <div className="mb-6">
        <Link href="/dashboard/gelistirici/cv" className="text-sm text-muted-foreground hover:text-foreground">
          ← Geri Dön
        </Link>
      </div>

      {phase === "analyzing" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="size-14 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium text-foreground animate-pulse">CV analiz ediliyor...</p>
            <p className="text-sm text-muted-foreground mt-1">Bu işlem birkaç saniye sürebilir</p>
          </CardContent>
        </Card>
      )}

      {phase === "error" && (
        <Card className="border-destructive/30">
          <CardContent className="py-8 space-y-4">
            <div className="flex items-start gap-2 text-destructive">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              CV listenizden yüklediğiniz dosyayı görebilir ve analiz durumunu takip edebilirsiniz.
            </p>
            <Button asChild>
              <Link href="/dashboard/gelistirici/cv">CV listesine git</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === "result" && resultData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-6 text-green-600" />
              Analiz tamamlandı
            </CardTitle>
            <CardDescription>Önerileri inceleyin ve isterseniz profilize ekleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {skills.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Briefcase className="size-4" />
                  Önerilen yetenekler
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={handleApplySkills}
                  disabled={applyingSkills}
                >
                  {applyingSkills ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Ekleniyor...
                    </>
                  ) : (
                    "Tümünü profilime ekle"
                  )}
                </Button>
              </div>
            )}

            {summary && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="size-4" />
                  Hakkımda önerisi
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">
                  {summary}
                </p>
                <Button size="sm" variant="outline" onClick={handleApplyBio} disabled={appliedBio}>
                  {appliedBio ? "Eklendi" : "Profilime ekle"}
                </Button>
              </div>
            )}

            {suggestedTitle && (
              <div className="space-y-2">
                <h4 className="font-medium">Önerilen unvan</h4>
                <p className="text-sm text-muted-foreground">{suggestedTitle}</p>
                <Button size="sm" variant="outline" onClick={handleApplyTitle} disabled={appliedTitle}>
                  {appliedTitle ? "Eklendi" : "Profilime ekle"}
                </Button>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button asChild>
                <Link href="/dashboard/gelistirici/cv">CV listesine git</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPhase("form")
                  setFile(null)
                  setResultData(null)
                  setCvId(null)
                  setAppliedBio(false)
                  setAppliedTitle(false)
                }}
              >
                Yeni CV yükle
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(phase === "form" || phase === "uploading") && (
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
                      <Button variant="outline" size="sm" onClick={() => setFile(null)} disabled={phase === "uploading"}>
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
              <Button
                onClick={handleUpload}
                disabled={!file || phase === "uploading"}
                className="flex-1"
              >
                {phase === "uploading" ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  "CV'yi Yükle"
                )}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/gelistirici/cv">İptal</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
