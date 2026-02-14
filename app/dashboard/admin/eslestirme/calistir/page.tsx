"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function RunMatchingPage() {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<string>("")
  const [result, setResult] = useState<{ success: boolean; matchCount: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const runMatching = async () => {
    setRunning(true)
    setProgress(0)
    setStatus("Başlatılıyor...")
    setError(null)
    setResult(null)

    try {
      // Simüle edilmiş eşleştirme algoritması
      // Gerçek uygulamada bu bir server action veya API route olmalı

      setStatus("CV'ler analiz ediliyor...")
      setProgress(25)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStatus("İş ilanları değerlendiriliyor...")
      setProgress(50)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStatus("Eşleştirmeler hesaplanıyor...")
      setProgress(75)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStatus("Sonuçlar kaydediliyor...")
      setProgress(90)
      await new Promise((resolve) => setTimeout(resolve, 500))

      setProgress(100)
      setStatus("Tamamlandı!")
      setResult({ success: true, matchCount: Math.floor(Math.random() * 20) + 5 })

      // 2 saniye sonra yönlendir
      setTimeout(() => {
        router.push("/dashboard/admin/eslestirme")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu")
      setRunning(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl min-h-screen">
      <div className="mb-6">
        <Link href="/dashboard/admin/eslestirme" className="text-sm text-muted-foreground hover:text-foreground">
          ← Geri Dön
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Eşleştirme Algoritması</CardTitle>
          <CardDescription>CV'leri iş ilanlarıyla otomatik eşleştirin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!running && !result && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Algoritma Hakkında:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• CV'lerden çıkarılan yetenekler iş ilanlarıyla karşılaştırılır</li>
                  <li>• Uyumluluk skoru %0-100 arası hesaplanır</li>
                  <li>• Eksik yetenekler ve eşleşenler raporlanır</li>
                  <li>• Sadece aktif ilanlar ve işlenmiş CV'ler kullanılır</li>
                </ul>
              </div>

              <Button onClick={runMatching} className="w-full" size="lg">
                Eşleştirmeyi Başlat
              </Button>
            </div>
          )}

          {running && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="text-sm font-medium">{status}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">%{progress} tamamlandı</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div
                className={`flex items-start gap-3 p-4 rounded-lg ${result.success ? "bg-success/10 border border-success/20" : "bg-destructive/10 border border-destructive/20"}`}
              >
                {result.success ? (
                  <CheckCircle className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium text-sm mb-1">Eşleştirme başarıyla tamamlandı!</p>
                  <p className="text-sm text-muted-foreground">{result.matchCount} yeni eşleşme oluşturuldu</p>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Eşleştirmeler sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
