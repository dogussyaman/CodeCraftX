"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Company, CompanyPlan, SubscriptionStatus } from "@/lib/types"

const PLAN_LABELS: Record<CompanyPlan, string> = {
  free: "Free",
  orta: "Orta",
  premium: "Premium",
}

const SUBSCRIPTION_LABELS: Record<SubscriptionStatus, string> = {
  pending_payment: "Ödeme Bekleniyor",
  active: "Aktif",
  past_due: "Ödeme Gecikmiş",
  cancelled: "İptal",
}

type CompanyWithExtras = Company & {
  contact_email?: string | null
  phone?: string | null
  address?: string | null
  legal_title?: string | null
  tax_number?: string | null
  tax_office?: string | null
}

export function CompanySettingsForm({ company }: { company: CompanyWithExtras }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: company.name || "",
    description: company.description || "",
    industry: company.industry || "",
    website: company.website || "",
    location: company.location || "",
    employee_count: company.employee_count || "",
    logo_url: company.logo_url || "",
    contact_email: company.contact_email || "",
    phone: company.phone || "",
    address: company.address || "",
    legal_title: company.legal_title || "",
    tax_number: company.tax_number || "",
    tax_office: company.tax_office || "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Oturum bulunamadı")

      const { error: dbError } = await supabase
        .from("companies")
        .update({
          name: formData.name.trim() || null,
          description: formData.description.trim() || null,
          industry: formData.industry.trim() || null,
          website: formData.website.trim() || null,
          location: formData.location.trim() || null,
          employee_count: formData.employee_count.trim() || null,
          logo_url: formData.logo_url.trim() || null,
          contact_email: formData.contact_email.trim() || null,
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          legal_title: formData.legal_title.trim() || null,
          tax_number: formData.tax_number.trim() || null,
          tax_office: formData.tax_office.trim() || null,
        })
        .eq("id", company.id)

      if (dbError) throw dbError
      router.push("/dashboard/company")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilirken bir hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Şirket Bilgileri</CardTitle>
          <CardDescription>Genel bilgilerinizi görüntüleyin ve güncelleyin. Plan ve abonelik durumu yalnızca görüntülenir.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
            <span className="font-medium text-muted-foreground">Plan:</span>
            <Badge variant="secondary">{PLAN_LABELS[(company.plan as CompanyPlan) ?? "free"]}</Badge>
            <span className="font-medium text-muted-foreground ml-2">Abonelik:</span>
            <Badge
              variant={
                company.subscription_status === "active"
                  ? "default"
                  : company.subscription_status === "pending_payment"
                    ? "secondary"
                    : "outline"
              }
            >
              {SUBSCRIPTION_LABELS[(company.subscription_status as SubscriptionStatus) ?? "pending_payment"]}
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://..."
                className="dark:bg-input/50 dark:border-input"
              />
              {formData.logo_url && (
                <div className="mt-2">
                  <img
                    src={formData.logo_url}
                    alt="Logo önizleme"
                    className="h-16 w-16 object-contain rounded border bg-muted"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Şirket Adı <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Acme Technology"
                className="dark:bg-input/50 dark:border-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Sektör</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="Örn: Yazılım, Finans"
                  className="dark:bg-input/50 dark:border-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Konum</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Örn: İstanbul, Türkiye"
                  className="dark:bg-input/50 dark:border-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://ornek.com"
                  className="dark:bg-input/50 dark:border-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee_count">Çalışan Sayısı</Label>
                <Input
                  id="employee_count"
                  value={formData.employee_count}
                  onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                  placeholder="Örn: 50-100"
                  className="dark:bg-input/50 dark:border-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">İletişim E-posta</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="iletisim@ornek.com"
                className="dark:bg-input/50 dark:border-input"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+90 ..."
                  className="dark:bg-input/50 dark:border-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Şirket adresi"
                  className="dark:bg-input/50 dark:border-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="legal_title">Ticari Unvan</Label>
                <Input
                  id="legal_title"
                  value={formData.legal_title}
                  onChange={(e) => setFormData({ ...formData, legal_title: e.target.value })}
                  placeholder="Örn: Acme Teknoloji A.Ş."
                  className="dark:bg-input/50 dark:border-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_number">Vergi Numarası</Label>
                <Input
                  id="tax_number"
                  value={formData.tax_number}
                  onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                  placeholder="Vergi no"
                  className="dark:bg-input/50 dark:border-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_office">Vergi Dairesi</Label>
              <Input
                id="tax_office"
                value={formData.tax_office}
                onChange={(e) => setFormData({ ...formData, tax_office: e.target.value })}
                placeholder="Vergi dairesi"
                className="dark:bg-input/50 dark:border-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Şirket hakkında kısa bir açıklama..."
                rows={4}
                className="dark:bg-input/50 dark:border-input"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                <AlertCircle className="size-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Değişiklikleri Kaydet"
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/company">İptal</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
  )
}
