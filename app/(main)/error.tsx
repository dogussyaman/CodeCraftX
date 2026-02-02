"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { AlertCircle, Home, RefreshCw } from "lucide-react"

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="size-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Bir Hata Oluştu</h1>
            <p className="text-muted-foreground">
              Beklenmeyen bir sorun oluştu. Lütfen tekrar deneyin veya ana sayfaya dönün.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={reset} size="lg" className="gap-2">
              <RefreshCw className="size-5" />
              Tekrar Dene
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/">
                <Home className="size-5" />
                Ana Sayfaya Dön
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
