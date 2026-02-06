import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase/server"
import { SubscriptionCard } from "@/components/company/SubscriptionCard"
import type { SubscriptionStatus } from "@/lib/types"
import Link from "next/link"

const SUBSCRIPTION_BADGE: Record<SubscriptionStatus, string> = {
  pending_payment: "Ödeme Bekleniyor",
  active: "Aktif",
  past_due: "Ödeme Gecikmiş",
  cancelled: "İptal",
}

export default async function CompanyDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Profil ve bağlı olduğu şirket
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, company_id")
    .eq("id", user.id)
    .single()

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, description, location, website, industry, employee_count, logo_url, plan, subscription_status, billing_period, current_plan_price, last_payment_at, subscription_ends_at, contact_email, phone, address, legal_title, tax_number, tax_office")
    .eq("id", profile?.company_id)
    .single()

  // Şirketin ilan ve başvuru istatistikleri
  const { count: jobCount } = await supabase
    .from("job_postings")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company?.id ?? "")

  const { data: companyJobs } = await supabase
    .from("job_postings")
    .select("id")
    .eq("company_id", company?.id ?? "")

  const jobIds = companyJobs?.map((j) => j.id) || []

  const { count: applicationCount } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true })
    .in("job_id", jobIds.length > 0 ? jobIds : [""])

  const companyWithExtras = company as typeof company & {
    contact_email?: string | null
    phone?: string | null
    address?: string | null
    legal_title?: string | null
    tax_number?: string | null
    tax_office?: string | null
  }

  const isPremium = company?.plan === "premium"

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-5xl">
      {/* Profil hero: logo + isim + aksiyon */}
      <div
        className={
          isPremium
            ? "rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-card shadow-[0_0_0_1px_rgba(245,158,11,0.1)] dark:border-amber-500/25 dark:shadow-[0_0_0_1px_rgba(245,158,11,0.15)]"
            : "rounded-2xl border bg-card overflow-hidden"
        }
      >
        <div
          className={
            isPremium
              ? "bg-gradient-to-r from-amber-500/10 via-muted/40 to-muted/40 px-6 py-8 md:px-8 md:py-10 dark:from-amber-500/15 dark:via-muted/40 dark:to-muted/40"
              : "bg-muted/40 px-6 py-8 md:px-8 md:py-10"
          }
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="shrink-0">
              {company?.logo_url ? (
                <img
                  src={company.logo_url}
                  alt=""
                  className="size-24 md:size-28 rounded-xl object-contain border-2 border-border bg-background shadow-sm"
                />
              ) : (
                <div className="size-24 md:size-28 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/50 flex items-center justify-center">
                  <span className="text-3xl text-muted-foreground font-light">?</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {company?.name ?? "Şirket Paneli"}
              </h1>
              <p className="text-muted-foreground mt-1">
                Şirketinizin ilanlarını ve başvurularını buradan yönetebilirsiniz.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {company?.plan && (
                  <span
                    className={
                      isPremium
                        ? "rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                        : "rounded-full border bg-muted px-3 py-1 text-sm font-medium text-muted-foreground"
                    }
                  >
                    {company.plan === "free" && "Free"}
                    {company.plan === "orta" && "Orta"}
                    {company.plan === "premium" && "Premium"}
                  </span>
                )}
                {company?.subscription_status && (
                  <span
                    className={`rounded-full border px-3 py-1 text-sm font-medium ${
                      company.subscription_status === "active"
                        ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                        : company.subscription_status === "pending_payment"
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : company.subscription_status === "past_due"
                            ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
                            : "border-muted bg-muted text-muted-foreground"
                    }`}
                  >
                    {SUBSCRIPTION_BADGE[company.subscription_status]}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/company/ayarlar"
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Şirket bilgilerini düzenle
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {company && (
        <div className="space-y-2">
          <SubscriptionCard
            companyId={company.id}
            plan={company.plan ?? "free"}
            subscriptionStatus={company.subscription_status ?? "pending_payment"}
            billingPeriod={company.billing_period ?? "monthly"}
            lastPaymentAt={company.last_payment_at}
            subscriptionEndsAt={company.subscription_ends_at}
            currentPlanPrice={company.current_plan_price}
          />
          <p className="text-sm text-muted-foreground">
            Plan değiştirmek veya ödeme geçmişini görüntülemek için{" "}
            <Link href="/dashboard/company/uyelik" className="text-primary underline-offset-2 hover:underline">
              Üyelik merkezine git
            </Link>
            .
          </p>
        </div>
      )}

      {/* İstatistikler */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div
          className={
            isPremium
              ? "rounded-xl border border-amber-500/20 bg-card p-5 flex flex-col gap-1 border-t-4 border-t-amber-500/50 dark:border-amber-500/25 dark:border-t-amber-500/40"
              : "rounded-xl border bg-card p-5 flex flex-col gap-1"
          }
        >
          <p className="text-sm font-medium text-muted-foreground">Toplam İlan</p>
          <p className="text-2xl font-semibold">{jobCount ?? 0}</p>
        </div>
        <div
          className={
            isPremium
              ? "rounded-xl border border-amber-500/20 bg-card p-5 flex flex-col gap-1 border-t-4 border-t-amber-500/50 dark:border-amber-500/25 dark:border-t-amber-500/40"
              : "rounded-xl border bg-card p-5 flex flex-col gap-1"
          }
        >
          <p className="text-sm font-medium text-muted-foreground">Toplam Başvuru</p>
          <p className="text-2xl font-semibold">{applicationCount ?? 0}</p>
        </div>
        <div
          className={
            isPremium
              ? "rounded-xl border border-amber-500/20 bg-card p-5 flex flex-col gap-1 border-t-4 border-t-amber-500/50 dark:border-amber-500/25 dark:border-t-amber-500/40"
              : "rounded-xl border bg-card p-5 flex flex-col gap-1"
          }
        >
          <p className="text-sm font-medium text-muted-foreground">Çalışan Sayısı</p>
          <p className="text-2xl font-semibold">{company?.employee_count || "-"}</p>
        </div>
      </div>

      {/* Tüm şirket bilgileri */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Genel Bilgiler</h2>
          <dl className="space-y-2 text-sm">
            <InfoRow label="Sektör" value={company?.industry} />
            <InfoRow label="Konum" value={company?.location} />
            <InfoRow
              label="Website"
              value={company?.website}
              href={company?.website ? company.website : undefined}
            />
            <InfoRow label="Çalışan sayısı" value={company?.employee_count} />
          </dl>
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">İletişim</h2>
          <dl className="space-y-2 text-sm">
            <InfoRow label="E-posta" value={companyWithExtras?.contact_email} />
            <InfoRow label="Telefon" value={companyWithExtras?.phone} />
            <InfoRow label="Adres" value={companyWithExtras?.address} />
          </dl>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Resmî Bilgiler</h2>
          <dl className="space-y-2 text-sm">
            <InfoRow label="Ticari unvan" value={companyWithExtras?.legal_title} />
            <InfoRow label="Vergi numarası" value={companyWithExtras?.tax_number} />
            <InfoRow label="Vergi dairesi" value={companyWithExtras?.tax_office} />
          </dl>
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold">Açıklama</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {company?.description || "Şirket açıklaması henüz eklenmemiş."}
          </p>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  href,
}: {
  label: string
  value?: string | null
  href?: string
}) {
  if (value == null || value === "") return <InfoRowRaw label={label} value="—" />
  if (href)
    return (
      <InfoRowRaw
        label={label}
        value={
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            {value}
          </a>
        }
      />
    )
  return <InfoRowRaw label={label} value={value} />
}

function InfoRowRaw({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="flex gap-2">
      <dt className="font-medium text-foreground shrink-0">{label}:</dt>
      <dd className="text-muted-foreground min-w-0">{value}</dd>
    </div>
  )
}

