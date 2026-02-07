"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GitBranch, Globe, Code2, FileText, MessageSquare } from "lucide-react"

export function ProjectsHowToJoin() {
  return (
    <div className="space-y-8">
      {/* GitHub ve Issues nedir? */}
      <Card className="border-primary/20 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="size-5 text-primary" />
            GitHub ve Issues Nedir?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground text-sm leading-relaxed">
          <p>
            <strong className="text-foreground">GitHub</strong>, yazılım projelerinin barındırıldığı, sürüm kontrolü (Git) ve iş birliği için kullanılan bir platformdur.{" "}
            <strong className="text-foreground">Issues (konu başlıkları)</strong> ise bir repoda yapılacak işleri, hata bildirimlerini veya fikirleri takip etmek için açılan görev kayıtlarıdır.
          </p>
          <p>
            Proje sahipleri &quot;Şu özelliği ekleyin&quot;, &quot;Bu hata düzeltilsin&quot; gibi konuları Issue olarak açar; geliştiriciler bu Issue&apos;lara yorum yapabilir, çözüm önerebilir veya &quot;Bu Issue üzerinde çalışıyorum&quot; diyerek katkıda bulunabilir. Issue&apos;lar sayesinde kim ne üzerinde çalışıyor netleşir ve çakışma azalır.
          </p>
        </CardContent>
      </Card>

      {/* İki yol: Platform veya GitHub */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="size-5 text-primary" />
              CodeCraftX Platformundan Katılım
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground text-sm leading-relaxed">
            <p>
              <strong className="text-foreground">1.</strong> Proje detay sayfasına gidin (listeden bir projeye tıklayın).
            </p>
            <p>
              <strong className="text-foreground">2.</strong> &quot;Katılma isteği gönder&quot; butonuna tıklayın. Proje sahibine platform üzerinden bir istek gider.
            </p>
            <p>
              <strong className="text-foreground">3.</strong> İstek onaylandığında proje ekibine dahil olursunuz; proje sahibi sizinle iletişime geçebilir ve GitHub organizasyonuna davet edebilir.
            </p>
            <p>
              Bu yöntem, özellikle &quot;Önce tanışalım, sonra repoya ekleyelim&quot; diyen projeler için uygundur. Tüm süreç CodeCraftX içinde takip edilir.
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GitBranch className="size-5 text-primary" />
              GitHub Üzerinden Katılım
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground text-sm leading-relaxed">
            <p>
              <strong className="text-foreground">1. Repoyu inceleyin:</strong> Proje kartındaki GitHub bağlantısına giderek <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">README.md</code> ve varsa <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">CONTRIBUTING.md</code> dosyalarını okuyun.
            </p>
            <p>
              <strong className="text-foreground">2. Issue&apos;lara bakın:</strong> &quot;Good first issue&quot; veya &quot;help wanted&quot; etiketli konulara yorum yaparak &quot;Bu konuda çalışmak istiyorum&quot; diyebilirsiniz.
            </p>
            <p>
              <strong className="text-foreground">3. Repoyu fork’layın:</strong> GitHub&apos;da &quot;Fork&quot; butonu ile kendi hesabınıza kopyalayın. Yerel geliştirme için: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">git clone &lt;repo-url&gt;</code>
            </p>
            <p>
              <strong className="text-foreground">4. Değişiklik yapıp Pull Request (PR) açın:</strong> Kendi fork’unuzda branch oluşturup değişiklikleri yapın, ardından orijinal repoya &quot;Pull Request&quot; açın. Proje sahibi inceleyip kabul eder veya geri bildirim verir.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CONTRIBUTING ve pratik ipuçları */}
      <Card className="border-primary/20 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="size-5 text-primary" />
            CONTRIBUTING.md ve İpuçları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground text-sm leading-relaxed">
          <p>
            Birçok repo <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">CONTRIBUTING.md</code> dosyası bulundurur. Bu dosyada katkı süreci, branch isimlendirme, commit mesajı kuralları ve PR şablonları açıklanır. Katkıda bulunmadan önce bu dosyayı okumak, proje standartlarına uymanızı sağlar.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Issue açmadan veya PR göndermeden önce mevcut Issue/PR’ları kontrol edin; aynı konu açılmış olabilir.</li>
            <li>Küçük ve odaklı PR’lar daha hızlı incelenir; tek bir özellik veya düzeltme için PR açmak tercih edilir.</li>
            <li>Proje sahibi sizden test yazmanızı veya dokümantasyon güncellemenizi isteyebilir; CONTRIBUTING.md’de belirtilir.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Özet: Hangi yolu seçmeli? */}
      <Card className="border-primary/10 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Code2 className="size-4 text-primary" />
            Özet: Hangi Yolu Seçmeliyim?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground leading-relaxed">
          Proje &quot;CodeCraftX üzerinden katılım kabul ediyor&quot; diyorsa önce <strong className="text-foreground">platformdan katılma isteği</strong> gönderin; onay sonrası proje sahibi sizi yönlendirir. Doğrudan kod yazıp katkıda bulunmak istiyorsanız <strong className="text-foreground">GitHub</strong> tarafında Issue’lara bakıp fork → değişiklik → Pull Request sürecini izleyin. İki yöntem de birbirini tamamlar: önce platformdan tanışıp sonra GitHub’da PR açabilirsiniz.
        </CardContent>
      </Card>
    </div>
  )
}
