"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function CompanyCreateHrPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    title: "",
    phone: "",
    tempPassword: "",
    bio: "",
    website: "",
    avatarUrl: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/company/create-hr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          title: formData.title || undefined,
          phone: formData.phone || undefined,
          tempPassword: formData.tempPassword || undefined,
          bio: formData.bio || undefined,
          website: formData.website || undefined,
          avatar_url: formData.avatarUrl || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "İK kullanıcısı oluşturulurken bir hata oluştu.")
        setLoading(false)
        return
      }

      router.push("/dashboard/company/calisanlar")
    } catch (err: any) {
      setError(err?.message || "Beklenmeyen bir hata oluştu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl min-h-screen">
      <div className="mb-6">
        <Link href="/dashboard/company/calisanlar" className="text-sm text-muted-foreground hover:text-foreground">
          ← Çalışan listesine dön
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Yeni İK Kullanıcısı Oluştur</CardTitle>
          <CardDescription>Şirketiniz için yeni bir İK kullanıcısı ekleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Temel bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="fullName">
                    Ad Soyad <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Örn: Ayşe Yılmaz"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">
                    E-posta <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ornek@sirket.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Pozisyon</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Örn: Senior HR Manager"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+90 ..."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tempPassword">Geçici Şifre (opsiyonel)</Label>
                  <Input
                    id="tempPassword"
                    type="text"
                    value={formData.tempPassword}
                    onChange={(e) => setFormData({ ...formData, tempPassword: e.target.value })}
                    placeholder="Boş bırakılırsa otomatik üretilir"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Ek bilgiler (opsiyonel)</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Kısa öz geçmiş veya tanım"
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                <AlertCircle className="size-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/company/calisanlar">İptal</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Oluşturuluyor..." : "İK Kullanıcısını Oluştur"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

