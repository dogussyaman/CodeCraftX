"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { MT_DASHBOARD_LOGIN_URL } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { signInSchema, type SignInFormValues } from "@/lib/validations"
import { CheckCircle2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function LoginForm() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showMtDialog, setShowMtDialog] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const passwordReset = searchParams.get("password_reset")
        if (passwordReset === "success") {
            setSuccess("Şifreniz başarıyla sıfırlandı. Lütfen yeni şifrenizle giriş yapın.")
            router.replace("/auth/giris")
            return
        }
        const urlError = searchParams.get("error")
        const urlMessage = searchParams.get("message") ?? ""
        if (urlError && (urlMessage.toLowerCase().includes("mt") || urlMessage.includes("müşteri temsilcisi"))) {
            setError(null)
            setShowMtDialog(true)
            return
        }
    }, [searchParams, router])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
    })

    const onSubmit = async (data: SignInFormValues) => {
        const supabase = createClient()
        setIsLoading(true)
        setError(null)

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })
            if (authError) throw authError

            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase.from("profiles").select("role, must_change_password").eq("id", user.id).single()

                // İlk giriş şifre değiştirme kontrolü
                if (profile?.must_change_password) {
                    router.push("/auth/sifre-degistir?first_login=true")
                    return
                }

                if (profile?.role === "mt") {
                    await supabase.auth.signOut()
                    setError(null)
                    setShowMtDialog(true)
                    return
                }
                if (profile?.role === "admin" || profile?.role === "platform_admin") {
                    router.push("/dashboard/admin")
                } else if (profile?.role === "hr") {
                    router.push("/dashboard/ik")
                } else if (profile?.role === "company_admin") {
                    router.push("/dashboard/company")
                } else {
                    router.push("/dashboard/gelistirici")
                }
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                // Supabase hata mesajlarını Türkçeleştir
                const errorMessage = error.message.toLowerCase()
                if (errorMessage.includes("invalid login credentials") || errorMessage.includes("invalid password")) {
                    setError("E-posta veya şifre hatalı. Lütfen kontrol edin.")
                } else if (errorMessage.includes("email not confirmed")) {
                    setError("E-posta adresinizi doğrulamanız gerekiyor. Lütfen e-postanızı kontrol edin.")
                } else if (errorMessage.includes("too many requests")) {
                    setError("Çok fazla deneme yapıldı. Lütfen bir süre sonra tekrar deneyin.")
                } else {
                    setError(error.message || "Giriş yapılırken bir hata oluştu")
                }
            } else {
                setError("Giriş yapılırken bir hata oluştu")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleOAuthLogin = async (provider: "google" | "github") => {
        const supabase = createClient()
        setIsLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) throw error
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : "OAuth girişi başarısız")
            setIsLoading(false)
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">
                        E-posta <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="ornek@email.com"
                        {...register("email")}
                        className={`h-11 ${errors.email ? "border-destructive" : ""}`}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">
                            Şifre <span className="text-destructive">*</span>
                        </Label>
                        <Link
                            href="/auth/sifre-unuttum"
                            className="text-xs text-primary hover:underline font-medium"
                        >
                            Şifremi Unuttum
                        </Link>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...register("password")}
                        className={`h-11 ${errors.password ? "border-destructive" : ""}`}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>

                {success && (
                    <div className="text-sm text-success bg-success/10 p-3 rounded-lg border border-success/20 flex items-center gap-2">
                        <CheckCircle2 className="size-4" />
                        {success}
                    </div>
                )}

                {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                    {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Ya da</span>
                </div>
            </div>

            <div className="space-y-3">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 bg-transparent hover:bg-muted hover:text-foreground border-border"
                    onClick={() => handleOAuthLogin("google")}
                    disabled={isLoading}
                >
                    <svg className="mr-2 size-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google ile Giriş Yap
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 bg-transparent hover:bg-muted hover:text-foreground border-border"
                    onClick={() => handleOAuthLogin("github")}
                    disabled={isLoading}
                >
                    <svg className="mr-2 size-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub ile Giriş Yap
                </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
                Hesabınız yok mu?{" "}
                <Link href="/auth/kayit" className="text-primary hover:underline font-semibold">
                    Kayıt Ol
                </Link>
            </p>

            <AlertDialog open={showMtDialog} onOpenChange={setShowMtDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Müşteri Temsilcisi Hesabı</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu hesap müşteri temsilcisi (MT) paneli içindir. Giriş yapmak için MT Dashboard&apos;a
                            yönlendirileceksiniz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction
                            onClick={() => {
                                window.location.href = MT_DASHBOARD_LOGIN_URL
                            }}
                        >
                            MT Dashboard&apos;a Git
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
