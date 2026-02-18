"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { CompanyPlan } from "@/lib/types"
import { getPlanDisplayName } from "@/lib/billing/plans"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { JobListEditor } from "@/components/job-form/JobListEditor"
import { ProvinceDistrictSelect } from "@/components/location/ProvinceDistrictSelect"
import { DEFAULT_COUNTRY } from "@/lib/provinces-types"

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
    country: DEFAULT_COUNTRY,
    city: "",
    district: "",
    location: "",
    workPreferenceList: [] as string[],
    job_type: "",
    experience_level: "",
    status: "draft",
    visibility: "public" as "public" | "private" | "link_only",
    requires_approval: false,
    schedule_publish_at: "" as string,
    salary_visible: true,
    application_limit: null as number | null,
    featured: false,
    priority_level: null as number | null,
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
        .in("status", ["active", "published"])

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
          `İlan limitine ulaştınız (${getPlanDisplayName(companyPlan)} plan: ${planLimit} ilan). Plan yükseltmek için fiyatlandırma sayfamızı inceleyin.`
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
        location: common.location.trim() || common.city.trim() ? [common.city, common.district, common.country].filter(Boolean).join(", ") || null : null,
        country: common.country.trim() || null,
        city: common.city.trim() || null,
        district: common.district.trim() || null,
        work_preference: common.workPreferenceList[0] || null,
        work_preference_list: common.workPreferenceList.length ? common.workPreferenceList : [],
        job_type: common.job_type || null,
        experience_level: common.experience_level || null,
        status: common.status,
        visibility: common.visibility,
        requires_approval: common.requires_approval,
        schedule_publish_at: common.schedule_publish_at.trim() ? new Date(common.schedule_publish_at).toISOString() : null,
        salary_visible: common.salary_visible,
        application_limit: common.application_limit ?? null,
        featured: common.featured,
        priority_level: common.priority_level ?? null,
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
      <div className="min-h-screen from-muted/30 to-background">
        <div className="container mx-auto px-4 py-8 max-w-xl">
          <Card className="overflow-hidden rounded-2xl border-2 border-destructive/30 bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Şirket Bilgisi Bulunamadı</CardTitle>
              <CardDescription>
                Bu kullanıcıya bağlı bir şirket bulunamadı. Lütfen sistem yöneticiniz ile iletişime geçin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="rounded-xl" asChild>
                <Link href="/dashboard/company">Panele Dön</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen from-muted/30 to-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/dashboard/company/ilanlar"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground mb-8"
        >
          <ArrowLeft className="size-4" />
          İlanlara dön
        </Link>

        {subscriptionInactive && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Abonelik gerekli</p>
              <p className="mt-1 text-muted-foreground dark:text-amber-200/80">
                İlan oluşturmak için aboneliğinizin aktif olması gerekir. Şirket panelinden ödemeyi tamamlayın.
              </p>
            </div>
          </div>
        )}

        {atJobLimit && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">İlan limitine ulaştınız</p>
              <p className="mt-1 text-muted-foreground dark:text-amber-200/80">
                {companyPlan === "free" && "Basic plan: en fazla 5 aktif ilan."}
                {companyPlan === "orta" && "Pro plan: en fazla 100 aktif ilan."}
                {" "}
                <Link href="/#ucretlendirme" className="font-medium text-primary underline underline-offset-2 hover:no-underline">
                  Fiyatlandırma
                </Link>
              </p>
            </div>
          </div>
        )}

        <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 bg-muted/20 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="size-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl tracking-tight">Yeni İş İlanı</CardTitle>
                <CardDescription className="mt-1">
                  Pozisyon bilgilerini girin. İçerik dil seçeneğine göre TR / EN / DE ekleyebilirsiniz.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <Tabs defaultValue="tr" className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted/60 p-1 mb-8">
                <TabsTrigger value="tr" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Türkçe</TabsTrigger>
                <TabsTrigger value="en" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">English</TabsTrigger>
                <TabsTrigger value="de" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Deutsch</TabsTrigger>
              </TabsList>
              <TabsContent value="tr" className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">
                    Pozisyon Adı (Türkçe) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    required
                    value={localeContent.tr.title}
                    onChange={(e) => updateLocale("tr", (p) => ({ ...p, title: e.target.value }))}
                    placeholder="Örn: Senior Full Stack Developer"
                    className="mt-2 rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Açıklama (Türkçe) <span className="text-destructive">*</span></Label>
                  <Textarea
                    required
                    value={localeContent.tr.description}
                    onChange={(e) => updateLocale("tr", (p) => ({ ...p, description: e.target.value }))}
                    placeholder="Pozisyon hakkında detaylı açıklama..."
                    rows={4}
                    className="mt-2 rounded-lg resize-none"
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
                    onSubtitleChange={() => { }}
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
                    onTitleChange={() => { }}
                    onSubtitleChange={() => { }}
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
                    onSubtitleChange={() => { }}
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
                    onTitleChange={() => { }}
                    onSubtitleChange={() => { }}
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
                    onSubtitleChange={() => { }}
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
                    onTitleChange={() => { }}
                    onSubtitleChange={() => { }}
                    onItemsChange={(v) => updateLocale("de", (p) => ({ ...p, responsibilitiesItems: v }))}
                    addLabel="Eintrag hinzufügen"
                    optional
                    showTitleSubtitle={false}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 space-y-5">
              <h3 className="text-base font-semibold text-foreground">Konum ve çalışma şekli</h3>
              <p className="text-sm text-muted-foreground -mt-1">Opsiyonel alanlar</p>
              <div>
                <Label className="mb-2 block text-sm font-medium">İl / İlçe</Label>
                <ProvinceDistrictSelect
                  city={common.city}
                  district={common.district}
                  onChange={({ country, city, district }) =>
                    setCommon((p) => ({ ...p, country, city, district }))
                  }
                  districtOptional
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Lokasyon (metin)</Label>
                <Input
                  value={common.location}
                  onChange={(e) => setCommon((p) => ({ ...p, location: e.target.value }))}
                  placeholder={common.city ? `${common.city}${common.district ? `, ${common.district}` : ""}, ${common.country}` : "Örn: İstanbul, Türkiye"}
                  className="mt-2 rounded-lg"
                />
              </div>
              <div>
                <Label className="mb-3 block text-sm font-medium">Çalışma tercihi</Label>
                <div className="flex flex-wrap gap-6">
                  {WORK_PREFERENCE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <Checkbox
                        checked={common.workPreferenceList.includes(opt.value)}
                        onCheckedChange={(c) => setWorkPreference(opt.value, !!c)}
                        className="rounded-md"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 rounded-2xl border border-border/60 bg-muted/20 p-6">
              <h3 className="text-base font-semibold text-foreground col-span-full -mb-1">İlan ayarları</h3>
              <div>
                <Label className="text-sm font-medium">Çalışma şekli</Label>
                <Select
                  value={common.job_type}
                  onValueChange={(v) => setCommon((p) => ({ ...p, job_type: v }))}
                >
                  <SelectTrigger className="mt-2 rounded-lg">
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
                <Label className="text-sm font-medium">Deneyim seviyesi</Label>
                <Select
                  value={common.experience_level}
                  onValueChange={(v) => setCommon((p) => ({ ...p, experience_level: v }))}
                >
                  <SelectTrigger className="mt-2 rounded-lg">
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
              <div className="md:col-span-2">
                <Label className="text-sm font-medium">Yayın durumu</Label>
                <Select
                  value={common.status}
                  onValueChange={(v) => setCommon((p) => ({ ...p, status: v }))}
                >
                  <SelectTrigger className="mt-2 rounded-lg w-full max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 space-y-4">
              <h3 className="text-base font-semibold text-foreground">Görünürlük ve yayın</h3>
              <div>
                <Label className="text-sm font-medium">Görünürlük</Label>
                <Select
                  value={common.visibility}
                  onValueChange={(v: "public" | "private" | "link_only") => setCommon((p) => ({ ...p, visibility: v }))}
                >
                  <SelectTrigger className="mt-2 rounded-lg max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Herkese açık</SelectItem>
                    <SelectItem value="private">Gizli</SelectItem>
                    <SelectItem value="link_only">Sadece link ile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="requires_approval_company"
                  checked={common.requires_approval}
                  onCheckedChange={(c) => setCommon((p) => ({ ...p, requires_approval: !!c }))}
                />
                <Label htmlFor="requires_approval_company" className="text-sm font-normal cursor-pointer">
                  Yayınlamak için şirket yöneticisi onayı gerekir
                </Label>
              </div>
              <div>
                <Label className="text-sm font-medium">Planlı yayın (opsiyonel)</Label>
                <Input
                  type="datetime-local"
                  value={common.schedule_publish_at}
                  onChange={(e) => setCommon((p) => ({ ...p, schedule_publish_at: e.target.value }))}
                  className="mt-2 rounded-lg max-w-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="salary_visible_company"
                  checked={common.salary_visible}
                  onCheckedChange={(c) => setCommon((p) => ({ ...p, salary_visible: !!c }))}
                />
                <Label htmlFor="salary_visible_company" className="text-sm font-normal cursor-pointer">
                  Maaş aralığı ilanda görünsün
                </Label>
              </div>
              <div>
                <Label className="text-sm font-medium">Başvuru limiti (opsiyonel)</Label>
                <Input
                  type="number"
                  min={0}
                  value={common.application_limit ?? ""}
                  onChange={(e) => setCommon((p) => ({ ...p, application_limit: e.target.value ? parseInt(e.target.value, 10) : null }))}
                  placeholder="Boş bırakılırsa sınırsız"
                  className="mt-2 rounded-lg max-w-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="featured_company"
                  checked={common.featured}
                  onCheckedChange={(c) => setCommon((p) => ({ ...p, featured: !!c }))}
                />
                <Label htmlFor="featured_company" className="text-sm font-normal cursor-pointer">
                  Öne çıkan ilan
                </Label>
              </div>
              <div>
                <Label className="text-sm font-medium">Öncelik seviyesi (opsiyonel)</Label>
                <Input
                  type="number"
                  value={common.priority_level ?? ""}
                  onChange={(e) => setCommon((p) => ({ ...p, priority_level: e.target.value ? parseInt(e.target.value, 10) : null }))}
                  placeholder="Sayı"
                  className="mt-2 rounded-lg max-w-xs"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertCircle className="size-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-3 pt-2">
              <Button type="button" variant="outline" className="rounded-xl" asChild>
                <Link href="/dashboard/company/ilanlar">İptal</Link>
              </Button>
              <Button
                type="submit"
                disabled={loading || atJobLimit || subscriptionInactive}
                className={cn(
                  "rounded-xl min-w-[160px]",
                  (atJobLimit || subscriptionInactive) && "opacity-90"
                )}
              >
                {loading
                  ? "Oluşturuluyor..."
                  : subscriptionInactive
                    ? "Abonelik gerekli"
                    : atJobLimit
                      ? "İlan limiti dolu"
                      : "İlanı oluştur"}
              </Button>
            </div>
          </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
