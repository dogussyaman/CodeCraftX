"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function CerezAyarlariPage() {
  const [ayarlar, setAyarlar] = useState({
    zorunlu: true, // Her zaman açık
    fonksiyonel: true,
    analitik: false,
    pazarlama: false,
  })

  const [kaydedildi, setKaydedildi] = useState(false)

  const handleSave = () => {
    // Çerez tercihlerini kaydet
    localStorage.setItem("cerez-tercihleri", JSON.stringify(ayarlar))
    setKaydedildi(true)
    setTimeout(() => setKaydedildi(false), 3000)
  }

  const handleAcceptAll = () => {
    setAyarlar({
      zorunlu: true,
      fonksiyonel: true,
      analitik: true,
      pazarlama: true,
    })
  }

  const handleRejectAll = () => {
    setAyarlar({
      zorunlu: true,
      fonksiyonel: false,
      analitik: false,
      pazarlama: false,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-32 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4 gradient-text">Çerez Ayarları</h1>
        <p className="text-lg text-muted-foreground mb-8">Platformumuzu kullanırken çerez tercihlerinizi yönetin</p>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Zorunlu Çerezler</CardTitle>
              <CardDescription>
                Bu çerezler platformun çalışması için gereklidir ve devre dışı bırakılamaz
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Temel İşlevsellik</Label>
                  <p className="text-sm text-muted-foreground">Giriş yapma, form gönderme ve güvenlik özellikleri</p>
                </div>
                <Switch checked={true} disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fonksiyonel Çerezler</CardTitle>
              <CardDescription>Gelişmiş özellikler ve kişiselleştirme için kullanılır</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="fonksiyonel">Kullanıcı Tercihleri</Label>
                  <p className="text-sm text-muted-foreground">Dil, tema ve diğer tercihlerinizi hatırlar</p>
                </div>
                <Switch
                  id="fonksiyonel"
                  checked={ayarlar.fonksiyonel}
                  onCheckedChange={(checked) => setAyarlar({ ...ayarlar, fonksiyonel: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analitik Çerezler</CardTitle>
              <CardDescription>Platform kullanımını analiz etmek ve iyileştirmek için kullanılır</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="analitik">Kullanım Analizi</Label>
                  <p className="text-sm text-muted-foreground">
                    Sayfa ziyaretleri, tıklama davranışı ve kullanım istatistikleri
                  </p>
                </div>
                <Switch
                  id="analitik"
                  checked={ayarlar.analitik}
                  onCheckedChange={(checked) => setAyarlar({ ...ayarlar, analitik: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pazarlama Çerezleri</CardTitle>
              <CardDescription>Kişiselleştirilmiş reklamlar ve kampanyalar için kullanılır</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="pazarlama">Hedefli Reklamlar</Label>
                  <p className="text-sm text-muted-foreground">İlgi alanlarınıza özel içerik ve reklamlar gösterir</p>
                </div>
                <Switch
                  id="pazarlama"
                  checked={ayarlar.pazarlama}
                  onCheckedChange={(checked) => setAyarlar({ ...ayarlar, pazarlama: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1" disabled={kaydedildi}>
              {kaydedildi ? "Kaydedildi ✓" : "Tercihleri Kaydet"}
            </Button>
            <Button onClick={handleAcceptAll} variant="outline" className="flex-1 bg-transparent">
              Tümünü Kabul Et
            </Button>
            <Button onClick={handleRejectAll} variant="outline" className="flex-1 bg-transparent">
              Tümünü Reddet
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Çerezler Hakkında</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground">
              Çerezler, web siteleri tarafından bilgisayarınıza veya mobil cihazınıza kaydedilen küçük metin
              dosyalarıdır. Web sitelerinin çalışmasını, daha verimli çalışmasını sağlamak ve site sahiplerine bilgi
              sağlamak için yaygın olarak kullanılırlar.
            </p>
            <p className="text-muted-foreground mt-4">
              Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz. Ancak bazı çerezleri devre dışı bırakmanız,
              platformun bazı özelliklerinin düzgün çalışmamasına neden olabilir.
            </p>
            <p className="text-muted-foreground mt-4">
              Tercihleriniz tarayıcınızda kaydedilir. Analitik ve pazarlama çerezleri yakında devreye alınacaktır;
              bu tarihten itibaren tercihleriniz platform genelinde uygulanacaktır.
            </p>
            <p className="text-muted-foreground mt-4">
              Daha fazla bilgi için{" "}
              <a href="/gizlilik-politikasi" className="text-primary hover:underline">
                Gizlilik Politikamızı
              </a>{" "}
              inceleyebilirsiniz.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
