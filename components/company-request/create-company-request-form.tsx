"use client"

import { useForm } from "react-hook-form"
import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { CheckCircle2, AlertCircle, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { companyRequestFormSchema, type CompanyRequestFormValues } from "@/lib/validations"
import { useAuth } from "@/hooks/use-auth"

const PLAN_OPTIONS: { value: "free" | "orta" | "premium"; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "orta", label: "Orta" },
  { value: "premium", label: "Premium" },
]

function parsePlanParam(param: string | null): "free" | "orta" | "premium" {
  if (param === "orta" || param === "premium" || param === "free") return param
  return "free"
}

function parseBillingParam(param: string | null): "monthly" | "annually" {
  if (param === "monthly" || param === "annually") return param
  return "monthly"
}

export function CreateCompanyRequestForm() {
  const { user, loading } = useAuth()
  const searchParams = useSearchParams()
  const planParam = parsePlanParam(searchParams.get("plan"))
  const billingParam = parseBillingParam(searchParams.get("billing"))

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyRequestFormValues>({
    resolver: zodResolver(companyRequestFormSchema),
    defaultValues: {
      company_name: "",
      company_website: "",
      company_description: "",
      company_size: "",
      industry: "",
      reason: "",
      contact_email: "",
      contact_phone: "",
      contact_address: "",
      plan: planParam,
      billing_period: billingParam,
    },
  })

  const onSubmit = async (data: CompanyRequestFormValues) => {
    if (!user?.id) {
      toast.error("Giriş yapmanız gerekiyor.", { icon: <AlertCircle className="h-5 w-5" /> })
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from("company_requests").insert({
        user_id: user.id,
        company_name: data.company_name.trim(),
        company_website: data.company_website?.trim() || null,
        company_description: data.company_description?.trim() || null,
        company_size: data.company_size?.trim() || null,
        industry: data.industry?.trim() || null,
        reason: data.reason.trim(),
        status: "pending",
        contact_email: data.contact_email?.trim() || null,
        contact_phone: data.contact_phone?.trim() || null,
        contact_address: data.contact_address?.trim() || null,
        plan: data.plan ?? "free",
        billing_period: data.billing_period ?? "monthly",
      })

      if (error) throw error

      toast.success("Şirket kayıt talebiniz alındı.", {
        description: "İncelendikten sonra size dönüş yapacağız.",
        icon: <CheckCircle2 className="h-5 w-5" />,
      })
      reset()
    } catch (err: unknown) {
      console.error("Company request error:", err)
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Talep gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
      toast.error("Hata", {
        description: message,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground py-4">Yükleniyor...</p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Plan</Label>
          <div className="flex flex-wrap gap-4">
            {PLAN_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={opt.value}
                  {...register("plan")}
                  className="rounded-full border-input"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
          {errors.plan && (
            <p className="text-sm text-destructive">{errors.plan.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Faturalandırma</Label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="monthly"
                {...register("billing_period")}
                className="rounded-full border-input"
              />
              <span className="text-sm">Aylık</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="annually"
                {...register("billing_period")}
                className="rounded-full border-input"
              />
              <span className="text-sm">Yıllık</span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company_name">
          Şirket adı <span className="text-destructive">*</span>
        </Label>
        <Input
          id="company_name"
          {...register("company_name")}
          placeholder="Şirket adınız"
          className={errors.company_name ? "border-destructive" : ""}
        />
        {errors.company_name && (
          <p className="text-sm text-destructive">{errors.company_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company_website">Şirket web sitesi (isteğe bağlı)</Label>
        <Input
          id="company_website"
          type="url"
          {...register("company_website")}
          placeholder="https://..."
          className={errors.company_website ? "border-destructive" : ""}
        />
        {errors.company_website && (
          <p className="text-sm text-destructive">{errors.company_website.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company_description">Şirket hakkında kısa açıklama (isteğe bağlı)</Label>
        <Textarea
          id="company_description"
          {...register("company_description")}
          placeholder="Ne iş yapıyorsunuz?"
          rows={2}
          className={errors.company_description ? "border-destructive" : ""}
        />
        {errors.company_description && (
          <p className="text-sm text-destructive">{errors.company_description.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company_size">Çalışan sayısı (isteğe bağlı)</Label>
          <Input
            id="company_size"
            {...register("company_size")}
            placeholder="Örn: 1-10, 11-50"
            className={errors.company_size ? "border-destructive" : ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Sektör (isteğe bağlı)</Label>
          <Input
            id="industry"
            {...register("industry")}
            placeholder="Örn: Yazılım, Finans"
            className={errors.industry ? "border-destructive" : ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_email">Şirket iletişim e-postası (isteğe bağlı)</Label>
        <Input
          id="contact_email"
          type="email"
          {...register("contact_email")}
          placeholder="sirket@ornek.com"
          className={errors.contact_email ? "border-destructive" : ""}
        />
        <p className="text-xs text-muted-foreground">Onay sonrası şirket hesabı bu adrese bağlanabilir.</p>
        {errors.contact_email && (
          <p className="text-sm text-destructive">{errors.contact_email.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact_phone">Şirket telefonu (isteğe bağlı)</Label>
          <Input
            id="contact_phone"
            {...register("contact_phone")}
            placeholder="Örn: +90 555 123 45 67"
            className={errors.contact_phone ? "border-destructive" : ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_address">Şirket adresi (isteğe bağlı)</Label>
          <Input
            id="contact_address"
            {...register("contact_address")}
            placeholder="İl, ilçe veya kısa adres"
            className={errors.contact_address ? "border-destructive" : ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">
          Neden şirket hesabı açmak istiyorsunuz? <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="reason"
          {...register("reason")}
          placeholder="Kısa gerekçenizi yazın..."
          rows={4}
          className={errors.reason ? "border-destructive" : ""}
        />
        {errors.reason && (
          <p className="text-sm text-destructive">{errors.reason.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? (
          "Gönderiliyor..."
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Talep Gönder
          </>
        )}
      </Button>
    </form>
  )
}
