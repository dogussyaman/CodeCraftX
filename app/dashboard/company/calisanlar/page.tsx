import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserPlus } from "lucide-react"
import Link from "next/link"
import { EmployeesTable } from "./_components/EmployeesTable"

export default async function CompanyEmployeesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single()

  if (!profile?.company_id) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl min-h-screen">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold">Şirket Bulunamadı</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Bu kullanıcıya bağlı bir şirket bulunamadı. Lütfen sistem yöneticiniz ile iletişime geçin.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: employees } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, title, phone, avatar_url, created_at, updated_at, must_change_password, bio, website")
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: true })

  const total = employees?.length ?? 0
  const hrCount = employees?.filter((e: { role: string }) => e.role === "hr").length ?? 0
  const ownerCount = employees?.filter((e: { role: string }) => e.role === "company_admin").length ?? 0

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Users className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Çalışanlar</h1>
            <p className="text-sm text-muted-foreground">
              Şirketinizdeki İK ve diğer kullanıcıların listesini görüntüleyin ve yönetin.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/dashboard/company/calisanlar/olustur">
            <UserPlus className="mr-2 size-4" />
            Yeni İK Kullanıcısı
          </Link>
        </Button>
      </div>

      {!employees || employees.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border bg-muted/30 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="size-16 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">Henüz çalışan eklenmemiş</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              İlk İK kullanıcınızı oluşturarak şirketiniz adına ilan yönetimine başlayabilirsiniz.
            </p>
            <Button asChild>
              <Link href="/dashboard/company/calisanlar/olustur">
                <UserPlus className="mr-2 size-4" />
                İK Kullanıcısı Oluştur
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Toplam üye</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{total}</p>
                    <p className="text-xs text-muted-foreground mt-1">Kayıtlı çalışan</p>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-2.5">
                    <Users className="size-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Şirket sahibi</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{ownerCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Yönetici hesabı</p>
                  </div>
                  <div className="rounded-xl bg-green-500/10 p-2.5">
                    <Users className="size-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">İK kullanıcısı</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{hrCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">İlan yönetimi</p>
                  </div>
                  <div className="rounded-xl bg-muted p-2.5">
                    <Users className="size-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Diğer</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{total - ownerCount - hrCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Diğer roller</p>
                  </div>
                  <div className="rounded-xl bg-muted p-2.5">
                    <Users className="size-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <EmployeesTable employees={employees} />
        </>
      )}
    </div>
  )
}

