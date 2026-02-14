"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle2, RefreshCw, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"

function VerifyOTPContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  const [otp, setOtp] = useState(["", "", "", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8)
    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)
    if (pastedData.length === 8) {
      inputRefs.current[7]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = otp.join("")
    if (code.length !== 8) {
      setError("Lütfen 8 haneli kodu girin")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup",
      })

      if (verifyError) throw verifyError

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/gelistirici")
      }, 1500)
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes("expired")) {
          setError("Kodun süresi dolmuş. Lütfen yeni kod isteyin.")
        } else if (err.message.includes("invalid")) {
          setError("Geçersiz kod. Lütfen tekrar deneyin.")
        } else {
          setError("Doğrulama başarısız. Lütfen tekrar deneyin.")
        }
      } else {
        setError("Bir hata oluştu. Lütfen tekrar deneyin.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return

    setIsResending(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      if (resendError) throw resendError

      setResendCooldown(60)
      setOtp(["", "", "", "", "", "", "", ""])
    } catch (err) {
      if (err instanceof Error) {
        setError("Kod gönderilemedi. Lütfen tekrar deneyin.")
      }
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden bg-background p-6">
        <div className="absolute inset-0 from-primary/20 via-transparent to-accent/20" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl p-8 text-center space-y-4">
            <h1 className="text-2xl font-bold">Geçersiz Erişim</h1>
            <p className="text-muted-foreground">E-posta adresi bulunamadı. Lütfen kayıt sayfasından tekrar deneyin.</p>
            <Button asChild className="w-full">
              <Link href="/auth/kayit">Kayıt Sayfasına Git</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden bg-background p-6">
      <div className="absolute inset-0 from-primary/20 via-transparent to-accent/20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl p-8"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {success ? (
            <div className="space-y-6 text-center">
              <div className="size-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-10 text-success" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Doğrulama Başarılı!</h1>
                <p className="text-muted-foreground">Hesabınız aktifleştirildi. Yönlendiriliyorsunuz...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Mail className="size-10 text-primary" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">E-posta Doğrulama</h1>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">{email}</span> adresine gönderilen 8 haneli kodu girin
                </p>
              </div>

              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-14 text-center text-xl font-bold"
                    disabled={isLoading}
                  />
                ))}
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}

              <Button
                onClick={handleVerify}
                disabled={isLoading || otp.join("").length !== 8}
                className="w-full h-12 rounded-xl  from-primary to-accent hover:opacity-90 transition-opacity"
              >
                {isLoading ? "Doğrulanıyor..." : "Doğrula"}
              </Button>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Kod gelmedi mi?</p>
                <Button
                  variant="ghost"
                  onClick={handleResend}
                  disabled={isResending || resendCooldown > 0}
                  className="gap-2"
                >
                  <RefreshCw className={`size-4 ${isResending ? "animate-spin" : ""}`} />
                  {resendCooldown > 0
                    ? `Tekrar gönder (${resendCooldown}s)`
                    : isResending
                      ? "Gönderiliyor..."
                      : "Tekrar Kod Gönder"}
                </Button>
              </div>

              <div className="pt-4 border-t border-border/50">
                <Link href="/auth/kayit" className="text-sm text-primary hover:underline">
                  Farklı bir e-posta ile kayıt ol
                </Link>
              </div>
              <div className="mt-5">
                <p className="text-sm text-muted-foreground text-center">Mail gelen kutusunda gözükmüyor ise spam kutusunu kontrol ediniz.</p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyOTPContent />
    </Suspense>
  )
}
