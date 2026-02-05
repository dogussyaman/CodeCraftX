"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Send, FileText, Upload, Loader2, Sparkles, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { CoverLetter } from "@/lib/types"

interface JobApplyModalProps {
    jobId: string
    jobTitle: string
    isOpen: boolean
    onClose: () => void
}

export function JobApplyModal({ jobId, jobTitle, isOpen, onClose }: JobApplyModalProps) {
    const [cvs, setCvs] = useState<any[]>([])
    const [templates, setTemplates] = useState<CoverLetter[]>([])
    const [selectedCvId, setSelectedCvId] = useState<string>("")
    const [coverLetter, setCoverLetter] = useState("")

    // Template states
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
    const [saveAsTemplate, setSaveAsTemplate] = useState(false)
    const [templateTitle, setTemplateTitle] = useState("")

    // Maaş beklentisi
    const [askExpectedSalary, setAskExpectedSalary] = useState(false)
    const [expectedSalaryRequired, setExpectedSalaryRequired] = useState(false)
    const [expectedSalary, setExpectedSalary] = useState<string>("")

    const [loading, setLoading] = useState(false)
    const [fetchingData, setFetchingData] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            setFetchingData(true)
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // İlan ayarlarını getir (maaş beklentisi)
                const { data: jobSettings } = await supabase
                    .from("job_postings")
                    .select("ask_expected_salary, expected_salary_required")
                    .eq("id", jobId)
                    .maybeSingle()

                if (jobSettings) {
                    setAskExpectedSalary(!!jobSettings.ask_expected_salary)
                    setExpectedSalaryRequired(!!jobSettings.expected_salary_required)
                } else {
                    setAskExpectedSalary(false)
                    setExpectedSalaryRequired(false)
                }

                // Fetch CVs
                const { data: cvData } = await supabase
                    .from("cvs")
                    .select("*")
                    .eq("developer_id", user.id)
                    .order("created_at", { ascending: false })

                setCvs(cvData || [])
                if (cvData && cvData.length > 0) {
                    setSelectedCvId(cvData[0].id)
                }

                // Fetch Templates
                const { data: templateData } = await supabase
                    .from("cover_letters")
                    .select("*")
                    .eq("developer_id", user.id)
                    .order("created_at", { ascending: false })

                setTemplates(templateData || [])

            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setFetchingData(false)
            }
        }

        if (isOpen) {
            fetchData()
            setSaveAsTemplate(false)
            setTemplateTitle("")
            setCoverLetter("")
            setSelectedTemplateId("")
            setExpectedSalary("")
        }
    }, [isOpen, supabase, jobId])

    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplateId(templateId)
        const template = templates.find(t => t.id === templateId)
        if (template) {
            setCoverLetter(template.content)
        }
    }

    const handleApply = async () => {
        try {
            setLoading(true)

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("Giriş yapmalısınız")
                return
            }

            if (!selectedCvId) {
                toast.error("Lütfen bir CV seçin")
                setLoading(false)
                return
            }

            // Maaş beklentisi kontrolü
            if (askExpectedSalary && expectedSalaryRequired && !expectedSalary.trim()) {
                toast.error("Lütfen maaş beklentinizi girin")
                setLoading(false)
                return
            }

            let expectedSalaryValue: number | null = null
            if (expectedSalary.trim()) {
                const parsed = Number(expectedSalary)
                if (Number.isNaN(parsed) || parsed < 0) {
                    toast.error("Lütfen geçerli bir maaş beklentisi girin")
                    setLoading(false)
                    return
                }
                expectedSalaryValue = parsed
            }

            // Template Saving Logic
            if (saveAsTemplate && coverLetter.trim()) {
                if (!templateTitle.trim()) {
                    toast.error("Şablon başlığı giriniz")
                    setLoading(false)
                    return
                }

                if (templates.length >= 5) {
                    toast.error("Maksimum 5 şablon limitine ulaştınız. Şablon kaydedilemedi ama başvuru devam ediyor.")
                } else {
                    const { error: templateError } = await supabase.from("cover_letters").insert({
                        developer_id: user.id,
                        title: templateTitle,
                        content: coverLetter
                    })

                    if (templateError) {
                        console.error("Template save error:", templateError)
                        toast.warning("Şablon kaydedilemedi, ancak başvuru işleminiz devam ediyor.")
                    } else {
                        toast.success("Yeni şablon kaydedildi")
                    }
                }
            }

            // Check for existing application
            const { data: existingApp } = await supabase
                .from("applications")
                .select("id")
                .eq("job_id", jobId)
                .eq("developer_id", user.id)
                .single()

            if (existingApp) {
                toast.error("Bu ilana zaten başvurdunuz")
                onClose()
                setLoading(false)
                return
            }

            const { data: applicationData, error } = await supabase
                .from("applications")
                .insert({
                    job_id: jobId,
                    developer_id: user.id,
                    cv_id: selectedCvId,
                    cover_letter: coverLetter || null,
                    expected_salary: expectedSalaryValue,
                })
                .select()
                .single()

            if (error) {
                if (error.code === "23505") {
                    toast.error("Bu ilana zaten başvurdunuz")
                } else {
                    throw error
                }
                return
            }

      // Başvuru için email bildirimi tetikle
      if (applicationData?.id) {
        void fetch("/api/email/application-submitted", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId: applicationData.id }),
        }).catch((err) => {
          console.error("Application submitted email trigger failed", err)
        })
      }

            // Application match Edge Function'ını tetikle
            if (applicationData?.id) {
                try {
                    const { error: matchError } = await supabase.functions.invoke("application-match", {
                        body: { application_id: applicationData.id },
                    })

                    if (matchError) {
                        console.warn("Match calculation failed:", matchError)
                        // Hata olsa bile devam et, başvuru kaydedildi
                    }
                } catch (matchErr) {
                    console.warn("Match function call failed:", matchErr)
                    // Hata olsa bile devam et
                }
            }

            toast.success("Başvurunuz alındı!", {
                description: "Başvurularım sayfasından süreci takip edebilirsiniz."
            })

            onClose()
            router.push("/dashboard/gelistirici/basvurular")

        } catch (err) {
            console.error("Application error:", err)
            toast.error("Başvuru sırasında hata oluştu")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>İş Başvurusu</DialogTitle>
                    <DialogDescription>
                        <span className="font-semibold text-foreground">{jobTitle}</span> pozisyonu için başvuruyorsunuz.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* CV Bölümü */}
                    <div className="space-y-2">
                        <Label>Kullanılacak CV</Label>
                        {fetchingData ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md">
                                <Loader2 className="size-4 animate-spin" />
                                Bilgiler yükleniyor...
                            </div>
                        ) : cvs.length === 0 ? (
                            <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center bg-muted/20">
                                <FileText className="size-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                                <p className="text-sm font-medium text-foreground mb-1">
                                    Kayıtlı CV bulunamadı
                                </p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Başvuru yapmak için önce CV yüklemeniz gerekmektedir.
                                </p>
                                <Button variant="outline" size="sm" asChild className="w-full">
                                    <Link href="/dashboard/gelistirici/cv/yukle">
                                        <Upload className="mr-2 size-4" />
                                        Yeni CV Yükle
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <Select value={selectedCvId} onValueChange={setSelectedCvId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="CV seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cvs.map((cv) => (
                                        <SelectItem key={cv.id} value={cv.id}>
                                            <div className="flex items-center gap-2">
                                                <FileText className="size-4 text-muted-foreground" />
                                                <span>{cv.file_name}</span>
                                                <span className="text-xs text-muted-foreground ml-auto">
                                                    {new Date(cv.created_at).toLocaleDateString("tr-TR")}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Ön Yazı Bölümü */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="cover-letter">Ön Yazı</Label>
                            {templates.length > 0 && (
                                <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                                    <SelectTrigger className="h-8 w-[180px] text-xs">
                                        <SelectValue placeholder="Şablondan doldur" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates.map((t) => (
                                            <SelectItem key={t.id} value={t.id} className="text-xs">
                                                {t.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <Textarea
                            id="cover-letter"
                            placeholder="Neden bu pozisyon için uygun olduğunuzu kısaca anlatın..."
                            value={coverLetter}
                            onChange={(e) => {
                                setCoverLetter(e.target.value)
                                if (selectedTemplateId) setSelectedTemplateId("") // Kullanıcı düzenlerse seçimi kaldır
                            }}
                            className="resize-none min-h-[150px]"
                        />

                        {/* Şablon Kaydetme Opsiyonu */}
                        {coverLetter.trim().length > 10 && templates.length < 5 && (
                            <div className="flex flex-col gap-3 p-3 bg-muted/30 rounded-lg border border-border/50 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="save-template"
                                        checked={saveAsTemplate}
                                        onCheckedChange={(checked) => setSaveAsTemplate(checked as boolean)}
                                    />
                                    <Label htmlFor="save-template" className="text-sm font-normal cursor-pointer flex items-center gap-1">
                                        <Sparkles className="size-3 text-warning" />
                                        Bu yazıyı şablon olarak kaydet
                                    </Label>
                                </div>

                                {saveAsTemplate && (
                                    <div className="pl-6 animate-in fade-in slide-in-from-top-1">
                                        <Input
                                            placeholder="Şablon Başlığı (Örn: Kurumsal Başvuru)"
                                            value={templateTitle}
                                            onChange={(e) => setTemplateTitle(e.target.value)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {templates.length >= 5 && coverLetter.trim().length > 10 && (
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground px-2">
                                <AlertCircle className="size-3" />
                                Maksimum 5 şablon limitine ulaştınız.
                            </div>
                        )}
                    </div>

                    {/* Maaş Beklentisi Bölümü */}
                    {askExpectedSalary && (
                        <div className="space-y-2">
                            <Label htmlFor="expected-salary">
                                Maaş Beklentiniz (aylık, net TL)
                                {expectedSalaryRequired && <span className="text-destructive ml-1">*</span>}
                            </Label>
                            <Input
                                id="expected-salary"
                                type="number"
                                placeholder="Örn: 65000"
                                value={expectedSalary}
                                onChange={(e) => setExpectedSalary(e.target.value)}
                                className="max-w-xs"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Bu bilgi yalnızca bu ilana yaptığınız başvuru için İK ekibiyle paylaşılır.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        İptal
                    </Button>
                    <Button
                        onClick={handleApply}
                        disabled={loading || (cvs.length === 0 && !fetchingData)}
                        className="px-6"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Başvuruluyor...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 size-4" />
                                Başvuruyu Tamamla
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
