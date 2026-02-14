 "use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { AuthSplitLayout } from "@/components/auth-split-layout"
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validations"
import { CheckCircle2, AlertCircle } from "lucide-react"

export function FirstLoginChangePasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [email, setEmail] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Kullanıcının oturumda olduğunu ve must_change_password flag'inin mantıklı olduğunu kontrol et
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/auth/giris")
        return
      }

      setEmail(user.email ?? null)

      // İlk giriş parametresi yoksa bile bu sayfaya gelmişse, devam etsin
      const firstLogin = searchParams.get("first_login")
      if (!firstLogin) {
        // Yine de erişime izin veriyoruz, sadece parametre yok uyarısı vermiyoruz
      }

      setIsCheckingAuth(false)
    }

    checkSession()
  }, [router, searchParams])

  const onSubmit = async (data: ResetPasswordFormValues) => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // Şifreyi güncelle
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (updateError) throw updateError

      // Şifre değişikliği emailini arka planda tetikle
      void fetch("/api/email/password-changed", {
        method: "POST",
      }).catch((err) => {
        console.error("Password changed email trigger failed", err)
      })

      // Profilde must_change_password flag'ini kapat
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.id) {
        throw new Error("Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.")
      }

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ must_change_password: false })
        .eq("id", user.id)

      if (profileUpdateError) {
        console.error("must_change_password update failed", profileUpdateError)
        throw new Error("Şifre güncellendi fakat profil bilgileri güncellenirken bir hata oluştu.")
      }

      // Oturumu tazele (mevcut Supabase sürümüne uyumlu olması için güvenli çağrı)
      try {
        const authAny = supabase.auth as any
        if (typeof authAny.refreshSession === "function") {
          await authAny.refreshSession()
        } else {
          await supabase.auth.getSession()
        }
      } catch (sessionError) {
        console.warn("Session refresh failed after password change", sessionError)
      }

      setSuccess(true)

      // Rolüne göre dashboard'a yönlendir
      setTimeout(async () => {
        const {
          data: { user: refreshedUser },
        } = await supabase.auth.getUser()

        if (!refreshedUser) {
          router.push("/auth/giris")
          return
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", refreshedUser.id)
          .single()

        const role = profile?.role || refreshedUser.user_metadata?.role || "developer"
        let redirectPath = "/dashboard/gelistirici"

        if (role === "admin") {
          redirectPath = "/dashboard/admin"
        } else if (role === "hr") {
          redirectPath = "/dashboard/ik"
        } else if (role === "company_admin") {
          redirectPath = "/dashboard/company"
        }

        router.push(redirectPath)
        router.refresh()
      }, 1500)
    } catch (error: any) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        if (errorMessage.includes("password")) {
          setError("Şifre gereksinimlerini karşılamıyor.")
        } else {
          setError(error.message || "Şifre güncellenirken bir hata oluştu")
        }
      } else {
        setError("Şifre güncellenirken bir hata oluştu")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <AuthSplitLayout title="Şifre Güncelleme" subtitle="Oturum doğrulanıyor...">
        <div className="flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Lütfen bekleyin...</p>
        </div>
      </AuthSplitLayout>
    )
  }

  if (error && !success) {
    // Genel hata state'i için üstte ayrı bir blok da göstereceğiz
  }

  if (success) {
    return (
      <AuthSplitLayout title="Şifre Güncellendi" subtitle="Şifreniz başarıyla değiştirildi">
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-success/10 rounded-lg border border-success/20">
            <CheckCircle2 className="size-12 text-success" />
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">Başarılı!</h3>
              <p className="text-sm text-muted-foreground">
                Şifreniz başarıyla güncellendi. Panelinize yönlendiriliyorsunuz...
              </p>
            </div>
          </div>
        </div>
      </AuthSplitLayout>
    )
  }

  return (
    <AuthSplitLayout
      title="İlk Giriş Şifre Değiştirme"
      subtitle="İlk girişiniz için size verilen geçici şifreyi yenisiyle değiştirin."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {email && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Giriş yaptığınız hesap: <span className="font-medium">{email}</span>
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">
            Yeni Şifre <span className="text-destructive">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            className={`h-11 ${errors.password ? "border-destructive" : ""}`}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            En az 8 karakter, büyük harf, küçük harf ve sayı içermelidir.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="repeatPassword">
            Şifre Tekrar <span className="text-destructive">*</span>
          </Label>
          <Input
            id="repeatPassword"
            type="password"
            placeholder="••••••••"
            {...register("repeatPassword")}
            className={`h-11 ${errors.repeatPassword ? "border-destructive" : ""}`}
          />
          {errors.repeatPassword && (
            <p className="text-sm text-destructive">{errors.repeatPassword.message}</p>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            <AlertCircle className="size-4 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? "Şifre güncelleniyor..." : "Şifreyi Güncelle"}
        </Button>
      </form>

      <div className="text-center space-y-2 mt-4">
        <Link href="/auth/giris" className="text-sm text-muted-foreground hover:text-foreground">
          Farklı bir hesapla giriş yap
        </Link>
      </div>
    </AuthSplitLayout>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <FirstLoginChangePasswordPage />
    </Suspense>
  )
}