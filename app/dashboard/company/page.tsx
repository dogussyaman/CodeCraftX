import { createClient } from "@/lib/supabase/server"

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
    .select("id, name, description, location, website, industry, employee_count, plan")
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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold">
            {company?.name ?? "Şirket Paneli"}
          </h1>
          {company?.plan && (
            <span className="rounded-full border bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
              {company.plan === "free" && "Free"}
              {company.plan === "orta" && "Orta"}
              {company.plan === "premium" && "Premium"}
            </span>
          )}
        </div>
        <p className="text-muted-foreground">
          Şirketinizin ilanlarını ve başvurularını buradan yönetebilirsiniz.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Toplam İlan</p>
          <p className="text-3xl font-semibold">{jobCount ?? 0}</p>
        </div>

        <div className="rounded-xl border bg-card p-6 flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Toplam Başvuru</p>
          <p className="text-3xl font-semibold">{applicationCount ?? 0}</p>
        </div>

        <div className="rounded-xl border bg-card p-6 flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Çalışan Sayısı (profil)</p>
          <p className="text-3xl font-semibold">
            {company?.employee_count ? company.employee_count : "-"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <h2 className="text-lg font-semibold">Şirket Bilgileri</h2>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Sektör: </span>
              {company?.industry || "-"}
            </p>
            <p>
              <span className="font-medium text-foreground">Konum: </span>
              {company?.location || "-"}
            </p>
            <p>
              <span className="font-medium text-foreground">Website: </span>
              {company?.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {company.website}
                </a>
              ) : (
                "-"
              )}
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-3">
          <h2 className="text-lg font-semibold">Açıklama</h2>
          <p className="text-sm text-muted-foreground">
            {company?.description || "Şirket açıklaması henüz eklenmemiş."}
          </p>
        </div>
      </div>
    </div>
  )
}

