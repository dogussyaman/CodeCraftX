"use client"

import type React from "react"

import { useState, useEffect } from "react"
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

export function ResetPasswordForm() {
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isValidatingToken, setIsValidatingToken] = useState(true)
    const router = useRouter()
    const searchParams = useSearchParams()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
    })

    useEffect(() => {
        const validateToken = async () => {
            const supabase = createClient()
            const hashParams = new URLSearchParams(window.location.hash.substring(1))
            const accessToken = hashParams.get("access_token")
            const type = hashParams.get("type")

            // URL'den token kontrolü
            if (accessToken && type === "recovery") {
                setIsValidatingToken(false)
                return
            }

            // Search params'dan kontrol
            const token = searchParams.get("token")
            if (token) {
                setIsValidatingToken(false)
                return
            }

            // Eğer token yoksa, hata göster
            setError("Geçersiz veya eksik şifre sıfırlama bağlantısı. Lütfen yeni bir şifre sıfırlama isteği gönderin.")
            setIsValidatingToken(false)
        }

        validateToken()
    }, [searchParams])

    const onSubmit = async (data: ResetPasswordFormValues) => {
        const supabase = createClient()
        setIsLoading(true)
        setError(null)

        try {
            // Hash'ten token'ı al
            const hashParams = new URLSearchParams(window.location.hash.substring(1))
            const accessToken = hashParams.get("access_token")
            const refreshToken = hashParams.get("refresh_token")

            if (accessToken && refreshToken) {
                // Session'ı oluştur
                const { error: sessionError } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                })

                if (sessionError) throw sessionError

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

                setSuccess(true)

                // 2 saniye sonra giriş sayfasına yönlendir
                setTimeout(() => {
                    router.push("/auth/giris?password_reset=success")
                }, 2000)
            } else {
                throw new Error("Geçersiz şifre sıfırlama bağlantısı")
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                const errorMessage = error.message.toLowerCase()
                if (errorMessage.includes("expired") || errorMessage.includes("invalid")) {
                    setError("Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı isteyin.")
                } else if (errorMessage.includes("password")) {
                    setError("Şifre gereksinimlerini karşılamıyor.")
                } else {
                    setError(error.message || "Şifre sıfırlanırken bir hata oluştu")
                }
            } else {
                setError("Şifre sıfırlanırken bir hata oluştu")
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (isValidatingToken) {
        return (
            <AuthSplitLayout title="Şifre Sıfırlama" subtitle="Bağlantı doğrulanıyor...">
                <div className="flex items-center justify-center p-6">
                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">Şifre sıfırlama bağlantısı kontrol ediliyor...</p>
                    </div>
                </div>
            </AuthSplitLayout>
        )
    }

    if (error && !success) {
        return (
            <AuthSplitLayout title="Hata" subtitle="Şifre sıfırlama bağlantısı geçersiz">
                <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-destructive/10 rounded-lg border border-destructive/20">
                        <AlertCircle className="size-12 text-destructive" />
                        <div className="text-center space-y-2">
                            <h3 className="font-semibold text-lg text-destructive">Bağlantı Geçersiz</h3>
                            <p className="text-sm text-muted-foreground">{error}</p>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <Link href="/auth/sifre-unuttum">
                            <Button className="w-full">Yeni Şifre Sıfırlama İsteği Gönder</Button>
                        </Link>
                        <Link href="/auth/giris">
                            <Button variant="outline" className="w-full">
                                Giriş Sayfasına Dön
                            </Button>
                        </Link>
                    </div>
                </div>
            </AuthSplitLayout>
        )
    }

    if (success) {
        return (
            <AuthSplitLayout title="Şifre Sıfırlandı" subtitle="Şifreniz başarıyla güncellendi">
                <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-success/10 rounded-lg border border-success/20">
                        <CheckCircle2 className="size-12 text-success" />
                        <div className="text-center space-y-2">
                            <h3 className="font-semibold text-lg">Başarılı!</h3>
                            <p className="text-sm text-muted-foreground">
                                Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
                            </p>
                        </div>
                    </div>
                </div>
            </AuthSplitLayout>
        )
    }

    return (
        <AuthSplitLayout title="Yeni Şifre Belirle" subtitle="Yeni şifrenizi belirleyin">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    <p className="text-xs text-muted-foreground">
                        En az 8 karakter, büyük harf, küçük harf ve sayı içermelidir
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
                    {errors.repeatPassword && <p className="text-sm text-destructive">{errors.repeatPassword.message}</p>}
                </div>

                {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                    {isLoading ? "Şifre güncelleniyor..." : "Şifreyi Güncelle"}
                </Button>
            </form>

            <div className="text-center space-y-2">
                <Link href="/auth/giris" className="text-sm text-muted-foreground hover:text-foreground">
                    Giriş sayfasına dön
                </Link>
            </div>
        </AuthSplitLayout>
    )
}
