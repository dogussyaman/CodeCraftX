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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { JobListEditor } from "@/components/job-form/JobListEditor"

const JOB_LIMITS: Record<Exclude<CompanyPlan, "premium">, number> = { free: 5, orta: 100 }

const WORK_PREFERENCE_OPTIONS = [
  { value: "on-site", label: "İş Yerinde" },
  { value: "remote", label: "Uzaktan / Remote" },
  { value: "hybrid", label: "Hibrit" },
]

type LocaleKey = "tr" | "en" | "de"

const defaultLocaleContent = () => ({
  title: "",
  description: "",
  requirementsTitle: "",
  requirementsSubtitle: "",
  requirementsItems: [] as string[],
  candidateCriteriaTitle: "",
  candidateCriteriaItems: [] as string[],
  responsibilitiesItems: [] as string[],
})

export default function CompanyCreateJobPage() {
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyPlan, setCompanyPlan] = useState<CompanyPlan | null>(null)
  const [activeJobCount, setActiveJobCount] = useState<number>(0)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [localeContent, setLocaleContent] = useState<Record<LocaleKey, ReturnType<typeof defaultLocaleContent>>>({
    tr: defaultLocaleContent(),
    en: defaultLocaleContent(),
    de: defaultLocaleContent(),
  })
  const [common, setCommon] = useState({
    country: "",
    city: "",
    district: "",
    location: "",
    workPreferenceList: [] as string[],
    job_type: "",
    experience_level: "",
    salary_min: "",
    salary_max: "",
    status: "draft",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchCompany = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/auth/giris")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

      if (!profile?.company_id) {
        setCompanyId(null)
        return
      }

      setCompanyId(profile.company_id)

      const { data: company } = await supabase
        .from("companies")
        .select("plan, subscription_status")
        .eq("id", profile.company_id)
        .single()

      setCompanyPlan((company?.plan as CompanyPlan) || "free")
      setSubscriptionStatus(company?.subscription_status ?? "pending_payment")

      const { count } = await supabase
        .from("job_postings")
        .select("id", { count: "exact", head: true })
        .eq("company_id", profile.company_id)
        .eq("status", "active")

      setActiveJobCount(count ?? 0)
    }
    fetchCompany()
  }, [router])

  const planLimit = companyPlan && companyPlan !== "premium" ? JOB_LIMITS[companyPlan] : null
  const atJobLimit = planLimit != null && activeJobCount >= planLimit
  const subscriptionInactive = subscriptionStatus !== null && subscriptionStatus !== "active"

  const updateLocale = (locale: LocaleKey, updater: (prev: ReturnType<typeof defaultLocaleContent>) => ReturnType<typeof defaultLocaleContent>) => {
    setLocaleContent((prev) => ({ ...prev, [locale]: updater(prev[locale]) }))
  }

  const setWorkPreference = (value: string, checked: boolean) => {
    setCommon((prev) => ({
      ...prev,
      workPreferenceList: checked
        ? [...prev.workPreferenceList.filter((w) => w !== value), value]
        : prev.workPreferenceList.filter((w) => w !== value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (atJobLimit || subscriptionInactive) return
    const tr = localeContent.tr
    if (!tr.title.trim()) {
      setError("Türkçe pozisyon adı zorunludur.")
      return
    }
    if (!tr.description.trim()) {
      setError("Türkçe açıklama zorunludur.")
      return
    }
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Kullanıcı bulunamadı")
      if (!companyId) throw new Error("Bu kullanıcıya bağlı bir şirket bulunamadı")
      if (subscriptionInactive) {
        throw new Error("Aboneliğiniz aktif değildir. İlan oluşturmak için önce ödemeyi tamamlayın.")
      }
      if (atJobLimit)
        throw new Error(
          `İlan limitine ulaştınız (${companyPlan === "free" ? "Free" : "Orta"} plan: ${planLimit} ilan). Plan yükseltmek için fiyatlandırma sayfamızı inceleyin.`
        )

      const toJsonb = (arr: string[]) => (arr.filter((s) => s.trim()).length ? arr.filter((s) => s.trim()) : [])

      const { error: dbError } = await supabase.from("job_postings").insert({
        company_id: companyId,
        title: tr.title.trim(),
        title_en: localeContent.en.title.trim() || null,
        title_de: localeContent.de.title.trim() || null,
        description: tr.description.trim(),
        description_en: localeContent.en.description.trim() || null,
        description_de: localeContent.de.description.trim() || null,
        requirements: null,
        requirements_tr: toJsonb(tr.requirementsItems),
        requirements_en: toJsonb(localeContent.en.requirementsItems),
        requirements_de: toJsonb(localeContent.de.requirementsItems),
        requirements_title_tr: tr.requirementsTitle.trim() || null,
        requirements_title_en: localeContent.en.requirementsTitle.trim() || null,
        requirements_title_de: localeContent.de.requirementsTitle.trim() || null,
        requirements_subtitle_tr: tr.requirementsSubtitle.trim() || null,
        requirements_subtitle_en: localeContent.en.requirementsSubtitle.trim() || null,
        requirements_subtitle_de: localeContent.de.requirementsSubtitle.trim() || null,
        candidate_criteria_tr: toJsonb(tr.candidateCriteriaItems),
        candidate_criteria_en: toJsonb(localeContent.en.candidateCriteriaItems),
        candidate_criteria_de: toJsonb(localeContent.de.candidateCriteriaItems),
        candidate_criteria_title_tr: tr.candidateCriteriaTitle.trim() || null,
        candidate_criteria_title_en: localeContent.en.candidateCriteriaTitle.trim() || null,
        candidate_criteria_title_de: localeContent.de.candidateCriteriaTitle.trim() || null,
        responsibilities_tr: toJsonb(tr.responsibilitiesItems),
        responsibilities_en: toJsonb(localeContent.en.responsibilitiesItems),
        responsibilities_de: toJsonb(localeContent.de.responsibilitiesItems),
        responsibilities: tr.responsibilitiesItems.filter((s) => s.trim()).length
          ? tr.responsibilitiesItems.filter((s) => s.trim()).join("\n")
          : null,
        location: common.location.trim() || common.city.trim() ? [common.city, common.country].filter(Boolean).join(", ") || null : null,
        country: common.country.trim() || null,
        city: common.city.trim() || null,
        district: common.district.trim() || null,
        work_preference: common.workPreferenceList[0] || null,
        work_preference_list: common.workPreferenceList.length ? common.workPreferenceList : [],
        job_type: common.job_type || null,
        experience_level: common.experience_level || null,
        salary_min: common.salary_min ? Number.parseInt(common.salary_min) : null,
        salary_max: common.salary_max ? Number.parseInt(common.salary_max) : null,
        status: common.status,
        created_by: user.id,
      })

      if (dbError) throw dbError

      router.push("/dashboard/company/ilanlar")
    } catch (err) {
      setError(err instanceof Error ? err.message : "İlan oluşturulurken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  if (!companyId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl min-h-screen">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Şirket Bilgisi Bulunamadı</CardTitle>
            <CardDescription>
              Bu kullanıcıya bağlı bir şirket bulunamadı. Lütfen sistem yöneticiniz ile iletişime geçin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/dashboard/company">Panele Dön</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl min-h-screen">
      <div className="mb-6">
        <Link href="/dashboard/company/ilanlar" className="text-sm text-muted-foreground hover:text-foreground">
          ← Geri Dön
        </Link>
      </div>

      {subscriptionInactive && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning-foreground">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Abonelik gerekli</p>
            <p className="mt-1 text-muted-foreground">
              İlan oluşturmak için aboneliğinizin aktif olması gerekir. Lütfen şirket panelinde ödeme adımını
              tamamlayın.
            </p>
          </div>
        </div>
      )}

      {atJobLimit && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning-foreground">
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
          <CardDescription>İş ilanı detaylarını girin. Etiketler Türkçe; içerik dil seçeneğine göre TR/EN/DE girebilirsiniz.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="tr" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="tr">Türkçe</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="de">Deutsch</TabsTrigger>
              </TabsList>
              <TabsContent value="tr" className="space-y-6">
                <div>
                  <Label>
                    Pozisyon Adı (Türkçe) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    required
                    value={localeContent.tr.title}
                    onChange={(e) => updateLocale("tr", (p) => ({ ...p, title: e.target.value }))}
                    placeholder="Örn: Senior Full Stack Developer"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Açıklama (Türkçe) <span className="text-destructive">*</span></Label>
                  <Textarea
                    required
                    value={localeContent.tr.description}
                    onChange={(e) => updateLocale("tr", (p) => ({ ...p, description: e.target.value }))}
                    placeholder="Pozisyon hakkında detaylı açıklama..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Gereksinimler (başlık, alt başlık, maddeler)</Label>
                  <JobListEditor
                    title={localeContent.tr.requirementsTitle}
                    subtitle={localeContent.tr.requirementsSubtitle}
                    items={localeContent.tr.requirementsItems}
                    onTitleChange={(v) => updateLocale("tr", (p) => ({ ...p, requirementsTitle: v }))}
                    onSubtitleChange={(v) => updateLocale("tr", (p) => ({ ...p, requirementsSubtitle: v }))}
                    onItemsChange={(v) => updateLocale("tr", (p) => ({ ...p, requirementsItems: v }))}
                    titleLabel="Başlık"
                    subtitleLabel="Alt başlık (örn: Senden neler bekliyoruz?)"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Aday Kriterleri (opsiyonel)</Label>
                  <JobListEditor
                    title={localeContent.tr.candidateCriteriaTitle}
                    subtitle=""
                    items={localeContent.tr.candidateCriteriaItems}
                    onTitleChange={(v) => updateLocale("tr", (p) => ({ ...p, candidateCriteriaTitle: v }))}
                    onSubtitleChange={() => {}}
                    onItemsChange={(v) => updateLocale("tr", (p) => ({ ...p, candidateCriteriaItems: v }))}
                    titleLabel="Başlık"
                    subtitleLabel=""
                    addLabel="Kriter ekle"
                    optional
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Sorumluluklar (opsiyonel, madde madde)</Label>
                  <JobListEditor
                    title=""
                    subtitle=""
                    items={localeContent.tr.responsibilitiesItems}
                    onTitleChange={() => {}}
                    onSubtitleChange={() => {}}
                    onItemsChange={(v) => updateLocale("tr", (p) => ({ ...p, responsibilitiesItems: v }))}
                    titleLabel=""
                    subtitleLabel=""
                    addLabel="Madde ekle"
                    optional
                    showTitleSubtitle={false}
                  />
                </div>
              </TabsContent>
              <TabsContent value="en" className="space-y-6">
                <div>
                  <Label>Pozisyon Adı (English)</Label>
                  <Input
                    value={localeContent.en.title}
                    onChange={(e) => updateLocale("en", (p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Senior Full Stack Developer"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Açıklama (English)</Label>
                  <Textarea
                    value={localeContent.en.description}
                    onChange={(e) => updateLocale("en", (p) => ({ ...p, description: e.target.value }))}
                    placeholder="Detailed description..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Gereksinimler (Requirements)</Label>
                  <JobListEditor
                    title={localeContent.en.requirementsTitle}
                    subtitle={localeContent.en.requirementsSubtitle}
                    items={localeContent.en.requirementsItems}
                    onTitleChange={(v) => updateLocale("en", (p) => ({ ...p, requirementsTitle: v }))}
                    onSubtitleChange={(v) => updateLocale("en", (p) => ({ ...p, requirementsSubtitle: v }))}
                    onItemsChange={(v) => updateLocale("en", (p) => ({ ...p, requirementsItems: v }))}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Aday Kriterleri (Candidate criteria)</Label>
                  <JobListEditor
                    title={localeContent.en.candidateCriteriaTitle}
                    subtitle=""
                    items={localeContent.en.candidateCriteriaItems}
                    onTitleChange={(v) => updateLocale("en", (p) => ({ ...p, candidateCriteriaTitle: v }))}
                    onSubtitleChange={() => {}}
                    onItemsChange={(v) => updateLocale("en", (p) => ({ ...p, candidateCriteriaItems: v }))}
                    addLabel="Add item"
                    optional
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Sorumluluklar (Responsibilities)</Label>
                  <JobListEditor
                    title=""
                    subtitle=""
                    items={localeContent.en.responsibilitiesItems}
                    onTitleChange={() => {}}
                    onSubtitleChange={() => {}}
                    onItemsChange={(v) => updateLocale("en", (p) => ({ ...p, responsibilitiesItems: v }))}
                    addLabel="Add item"
                    optional
                    showTitleSubtitle={false}
                  />
                </div>
              </TabsContent>
              <TabsContent value="de" className="space-y-6">
                <div>
                  <Label>Pozisyon Adı (Deutsch)</Label>
                  <Input
                    value={localeContent.de.title}
                    onChange={(e) => updateLocale("de", (p) => ({ ...p, title: e.target.value }))}
                    placeholder="z.B. Senior Full Stack Developer"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Açıklama (Deutsch)</Label>
                  <Textarea
                    value={localeContent.de.description}
                    onChange={(e) => updateLocale("de", (p) => ({ ...p, description: e.target.value }))}
                    placeholder="Ausführliche Beschreibung..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Gereksinimler (Anforderungen)</Label>
                  <JobListEditor
                    title={localeContent.de.requirementsTitle}
                    subtitle={localeContent.de.requirementsSubtitle}
                    items={localeContent.de.requirementsItems}
                    onTitleChange={(v) => updateLocale("de", (p) => ({ ...p, requirementsTitle: v }))}
                    onSubtitleChange={(v) => updateLocale("de", (p) => ({ ...p, requirementsSubtitle: v }))}
                    onItemsChange={(v) => updateLocale("de", (p) => ({ ...p, requirementsItems: v }))}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Aday Kriterleri</Label>
                  <JobListEditor
                    title={localeContent.de.candidateCriteriaTitle}
                    subtitle=""
                    items={localeContent.de.candidateCriteriaItems}
                    onTitleChange={(v) => updateLocale("de", (p) => ({ ...p, candidateCriteriaTitle: v }))}
                    onSubtitleChange={() => {}}
                    onItemsChange={(v) => updateLocale("de", (p) => ({ ...p, candidateCriteriaItems: v }))}
                    addLabel="Eintrag hinzufügen"
                    optional
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Sorumluluklar (Verantwortlichkeiten)</Label>
                  <JobListEditor
                    title=""
                    subtitle=""
                    items={localeContent.de.responsibilitiesItems}
                    onTitleChange={() => {}}
                    onSubtitleChange={() => {}}
                    onItemsChange={(v) => updateLocale("de", (p) => ({ ...p, responsibilitiesItems: v }))}
                    addLabel="Eintrag hinzufügen"
                    optional
                    showTitleSubtitle={false}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold">Konum ve çalışma şekli (opsiyonel)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Ülke</Label>
                  <Input
                    value={common.country}
                    onChange={(e) => setCommon((p) => ({ ...p, country: e.target.value }))}
                    placeholder="Türkiye"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Şehir</Label>
                  <Input
                    value={common.city}
                    onChange={(e) => setCommon((p) => ({ ...p, city: e.target.value }))}
                    placeholder="İstanbul"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>İlçe</Label>
                  <Input
                    value={common.district}
                    onChange={(e) => setCommon((p) => ({ ...p, district: e.target.value }))}
                    placeholder="İlçe"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Lokasyon (metin, opsiyonel)</Label>
                <Input
                  value={common.location}
                  onChange={(e) => setCommon((p) => ({ ...p, location: e.target.value }))}
                  placeholder="Örn: İstanbul, Türkiye"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="mb-2 block">Çalışma Tercihi</Label>
                <div className="flex flex-wrap gap-4">
                  {WORK_PREFERENCE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={common.workPreferenceList.includes(opt.value)}
                        onCheckedChange={(c) => setWorkPreference(opt.value, !!c)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
              <div>
                <Label>Çalışma Şekli</Label>
                <Select
                  value={common.job_type}
                  onValueChange={(v) => setCommon((p) => ({ ...p, job_type: v }))}
                >
                  <SelectTrigger className="mt-1">
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
              <div>
                <Label>Deneyim Seviyesi</Label>
                <Select
                  value={common.experience_level}
                  onValueChange={(v) => setCommon((p) => ({ ...p, experience_level: v }))}
                >
                  <SelectTrigger className="mt-1">
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
              <div>
                <Label>Durum</Label>
                <Select
                  value={common.status}
                  onValueChange={(v) => setCommon((p) => ({ ...p, status: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Minimum Maaş (₺)</Label>
                <Input
                  type="number"
                  value={common.salary_min}
                  onChange={(e) => setCommon((p) => ({ ...p, salary_min: e.target.value }))}
                  placeholder="25000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Maksimum Maaş (₺)</Label>
                <Input
                  type="number"
                  value={common.salary_max}
                  onChange={(e) => setCommon((p) => ({ ...p, salary_max: e.target.value }))}
                  placeholder="45000"
                  className="mt-1"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                <AlertCircle className="size-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading || atJobLimit || subscriptionInactive} className="flex-1">
                {loading
                  ? "Oluşturuluyor..."
                  : subscriptionInactive
                    ? "Abonelik Gerekli"
                    : atJobLimit
                      ? "İlan limitine ulaştınız"
                      : "İlanı Oluştur"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/company/ilanlar">İptal</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
