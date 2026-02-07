import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, Building2, Briefcase, Globe, FileText } from "lucide-react"

export default async function HRProfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/giris")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, title, phone, bio, website, avatar_url, company_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl min-h-screen">
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardContent className="p-6">
            <p className="text-muted-foreground">Profil bilgisi yüklenemedi.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  let companyName: string | null = null
  if (profile.company_id) {
    const { data: company } = await supabase
      .from("companies")
      .select("name")
      .eq("id", profile.company_id)
      .single()
    companyName = company?.name ?? null
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <User className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profilim</h1>
            <p className="text-sm text-muted-foreground">
              Hesap ve profil bilgilerinizi görüntüleyin.
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="text-lg">Kişisel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="shrink-0">
              {profile.avatar_url ? (
                <div className="relative size-24 rounded-full overflow-hidden border-2 border-border bg-muted">
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="object-cover size-full"
                  />
                </div>
              ) : (
                <div className="size-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                  <span className="text-2xl font-semibold text-muted-foreground">
                    {(profile.full_name ?? "?").slice(0, 1).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="grid gap-4 flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <User className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Ad Soyad</p>
                  <p className="text-sm font-medium text-foreground">{profile.full_name ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">E-posta</p>
                  <p className="text-sm font-medium text-foreground">{profile.email ?? "—"}</p>
                </div>
              </div>
              {profile.title && (
                <div className="flex items-start gap-3">
                  <Briefcase className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Pozisyon</p>
                    <p className="text-sm font-medium text-foreground">{profile.title}</p>
                  </div>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Telefon</p>
                    <p className="text-sm font-medium text-foreground">{profile.phone}</p>
                  </div>
                </div>
              )}
              {companyName && (
                <div className="flex items-start gap-3">
                  <Building2 className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Şirket</p>
                    <p className="text-sm font-medium text-foreground">{companyName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {(profile.bio || profile.website) && (
        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-lg">Ek Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {profile.bio && (
              <div className="flex items-start gap-3">
                <FileText className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{profile.bio}</p>
                </div>
              </div>
            )}
            {profile.website && (
              <div className="flex items-start gap-3">
                <Globe className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Website</p>
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline break-all"
                  >
                    {profile.website}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
