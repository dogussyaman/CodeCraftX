"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { CompanyPlan } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

const JOB_LIMITS: Record<Exclude<CompanyPlan, "premium">, number> = { free: 5, orta: 100 }

export default function CreateJobPage() {
  const [company, setCompany] = useState<{ id: string; plan?: CompanyPlan; [key: string]: unknown } | null>(null)
  const [activeJobCount, setActiveJobCount] = useState<number>(0)
  const [formData, setFormData] = useState({
    company_id: "",
    title: "",
    description: "",
    requirements: "",
    responsibilities: "",
    location: "",
    job_type: "",
    experience_level: "",
    salary_min: "",
    salary_max: "",
    status: "draft",
    ask_expected_salary: false,
    expected_salary_required: false,
  })
  const [loading, setLoading] = useState(false)
  const [loadingCompany, setLoadingCompany] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchCompanyForHR = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoadingCompany(false)
        setError("Kullanıcı bulunamadı")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single()

      if (!profile?.company_id) {
        setLoadingCompany(false)
        return
      }

      const { data: companyData } = await supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company_id)
        .single()

      if (companyData) {
        setCompany(companyData)
        setFormData((prev) => ({
          ...prev,
          company_id: profile.company_id,
        }))

        const { count } = await supabase
          .from("job_postings")
          .select("id", { count: "exact", head: true })
          .eq("company_id", profile.company_id)
          .eq("status", "active")
        setActiveJobCount(count ?? 0)
      }

      setLoadingCompany(false)
    }

    fetchCompanyForHR()
  }, [])

  const companyPlan: CompanyPlan | undefined = company?.plan ?? "free"
  const planLimit = companyPlan && companyPlan !== "premium" ? JOB_LIMITS[companyPlan] : null
  const atJobLimit = planLimit != null && activeJobCount >= planLimit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (atJobLimit) return
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Kullanıcı bulunamadı")
      if (!formData.company_id) throw new Error("Lütfen bir şirket seçin")
      if (atJobLimit)
        throw new Error(
          `İlan limitine ulaştınız (${companyPlan === "free" ? "Free" : "Orta"} plan: ${planLimit} ilan). Plan yükseltmek için fiyatlandırma sayfamızı inceleyin.`
        )

      const { error: dbError } = await supabase.from("job_postings").insert({
        company_id: formData.company_id,
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities || null,
        location: formData.location || null,
        job_type: formData.job_type || null,
        experience_level: formData.experience_level || null,
        salary_min: formData.salary_min ? Number.parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number.parseInt(formData.salary_max) : null,
        ask_expected_salary: formData.ask_expected_salary,
        expected_salary_required: formData.expected_salary_required,
        status: formData.status,
        created_by: user.id,
      })

      if (dbError) throw dbError

      router.push("/dashboard/ik/ilanlar")
    } catch (err) {
      setError(err instanceof Error ? err.message : "İlan oluşturulurken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  if (loadingCompany) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Yükleniyor</CardTitle>
            <CardDescription>Şirket bilginiz yükleniyor...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl min-h-screen">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Şirket Ataması Gerekli</CardTitle>
            <CardDescription>
              İş ilanı oluşturabilmek için profilinizin bir şirkete atanmış olması gerekiyor. Lütfen sistem yöneticinizle veya
              şirket yetkilinizle iletişime geçin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Şirket atamanız yapıldıktan sonra bu ekrandan doğrudan kendi şirketiniz için ilan oluşturabilirsiniz.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl min-h-screen">
      <div className="mb-6">
        <Link href="/dashboard/ik/ilanlar" className="text-sm text-muted-foreground hover:text-foreground">
          ← Geri Dön
        </Link>
      </div>

      {atJobLimit && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">İlan limitine ulaştınız</p>
            <p className="mt-1 text-muted-foreground">
              {companyPlan === "free" && "Free plan: en fazla 5 aktif ilan."}
              {companyPlan === "orta" && "Orta plan: en fazla 100 aktif ilan."}
              Plan yükseltmek için{" "}
              <Link href="/#ucretlendirme" className="text-primary hover:underline font-medium">
                fiyatlandırma sayfamızı
              </Link>{" "}
              inceleyin.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Yeni İş İlanı Oluştur</CardTitle>
          <CardDescription>İş ilanı detaylarını girin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>
                  Şirket <span className="text-destructive">*</span>
                </Label>
                <div className="px-3 py-2 rounded-md border bg-muted text-sm">
                  {company?.name ?? "Şirket bilgisi bulunamadı"}
                </div>
                <p className="text-xs text-muted-foreground">
                  İlanlarınız otomatik olarak bu şirkete bağlı oluşturulacaktır.
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">
                  Pozisyon Adı <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Örn: Senior Full Stack Developer"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">
                  Açıklama <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Pozisyon hakkında detaylı açıklama..."
                  rows={4}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="requirements">
                  Gereksinimler <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="requirements"
                  required
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Aranan nitelikler ve gereksinimler..."
                  rows={4}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="responsibilities">Sorumluluklar</Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  placeholder="Pozisyonun sorumlulukları ve görevleri..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">Bu alan opsiyoneldir</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokasyon</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Örn: İstanbul, Türkiye"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_type">Çalışma Şekli</Label>
                <Select
                  value={formData.job_type}
                  onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                >
                  <SelectTrigger id="job_type">
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Tam Zamanlı</SelectItem>
                    <SelectItem value="part-time">Yarı Zamanlı</SelectItem>
                    <SelectItem value="contract">Sözleşmeli</SelectItem>
                    <SelectItem value="internship">Staj</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_level">Deneyim Seviyesi</Label>
                <Select
                  value={formData.experience_level}
                  onValueChange={(value) => setFormData({ ...formData, experience_level: value })}
                >
                  <SelectTrigger id="experience_level">
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid-Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_min">Minimum Maaş (₺)</Label>
                <Input
                  id="salary_min"
                  type="number"
                  value={formData.salary_min}
                  onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                  placeholder="25000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_max">Maksimum Maaş (₺)</Label>
                <Input
                  id="salary_max"
                  type="number"
                  value={formData.salary_max}
                  onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                  placeholder="45000"
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="rounded-md border border-border/50 p-4 space-y-4">
                  <div>
                    <Label className="text-base font-medium mb-2 block">
                      Başvuru formunda adaydan net maaş beklentisi istenecek mi?
                    </Label>
                    <RadioGroup
                      value={formData.ask_expected_salary ? "yes" : "no"}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          ask_expected_salary: value === "yes",
                          // Hayır seçilirse zorunluluk da false olsun
                          expected_salary_required: value === "yes" ? prev.expected_salary_required : false,
                        }))
                      }
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="ask_salary_yes" />
                        <Label htmlFor="ask_salary_yes" className="font-normal cursor-pointer">
                          Evet
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="ask_salary_no" />
                        <Label htmlFor="ask_salary_no" className="font-normal cursor-pointer">
                          Hayır
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.ask_expected_salary && (
                    <div className="pt-2 border-t border-border/40">
                      <Label className="text-base font-medium mb-2 block">
                        Maaş beklentisi alanı zorunlu olsun mu?
                      </Label>
                      <RadioGroup
                        value={formData.expected_salary_required ? "yes" : "no"}
                        onValueChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            expected_salary_required: value === "yes",
                          }))
                        }
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="required_yes" />
                          <Label htmlFor="required_yes" className="font-normal cursor-pointer">
                            Evet
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="required_no" />
                          <Label htmlFor="required_no" className="font-normal cursor-pointer">
                            Hayır
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground pt-2">
                    Adaylar başvuru yaparken tek bir net maaş beklentisi yazacak. Bu bilgi sadece ilanınıza başvuran aday için
                    saklanır.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                <AlertCircle className="size-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading || atJobLimit} className="flex-1">
                {loading ? "Oluşturuluyor..." : atJobLimit ? "İlan limitine ulaştınız" : "İlanı Oluştur"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/ik/ilanlar">İptal</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
