"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { AuthSplitLayout } from "@/components/auth-split-layout"
import { CheckCircle2 } from "lucide-react"
import { ForgotPasswordFormValues, forgotPasswordSchema } from "@/lib/validations"

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/sifre-sifirla`,
      })

      if (resetError) throw resetError

      setSuccess(true)
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        if (errorMessage.includes("user not found")) {
          setError("Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.")
        } else if (errorMessage.includes("rate limit")) {
          setError("Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyin.")
        } else {
          setError(error.message || "Şifre sıfırlama e-postası gönderilirken bir hata oluştu")
        }
      } else {
        setError("Şifre sıfırlama e-postası gönderilirken bir hata oluştu")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <AuthSplitLayout title="E-posta Gönderildi" subtitle="Şifre sıfırlama bağlantısı e-postanıza gönderildi">
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-muted/50 rounded-lg border">
            <CheckCircle2 className="size-12 text-success" />
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">E-posta Gönderildi</h3>
              <p className="text-sm text-muted-foreground">
                Şifre sıfırlama bağlantısı e-postanıza gönderildi. Lütfen e-postanızı kontrol edin ve bağlantıya
                tıklayarak şifrenizi sıfırlayın.
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                E-postayı görmüyorsanız spam klasörünüzü kontrol edin.
              </p>
            </div>
          </div>

          <div className="text-center space-y-2">
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

  return (
    <AuthSplitLayout title="Şifremi Unuttum" subtitle="E-posta adresinize şifre sıfırlama bağlantısı göndereceğiz">
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
          <p className="text-xs text-muted-foreground">
            Kayıtlı e-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? "Gönderiliyor..." : "Şifre Sıfırlama Bağlantısı Gönder"}
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
