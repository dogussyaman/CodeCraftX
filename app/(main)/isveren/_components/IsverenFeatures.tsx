import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Target, Users, Award, Shield, Globe } from "lucide-react"

const features = [
  { icon: Building2, title: "Şirket Profili Yönetimi", desc: "Şirketinizin profilini oluşturun, logo ve bilgilerinizi güncelleyin. Marka kimliğinizi yansıtın." },
  { icon: Target, title: "Hedefli İlan Yayınlama", desc: "İlanlarınızı doğru adaylara ulaştırın. Yapay zeka algoritmamız ilanınızı en uygun adaylara gösterir." },
  { icon: Users, title: "Başvuru Yönetimi", desc: "Tüm başvuruları tek bir yerden yönetin. Adayları filtreleyin, sıralayın ve durumlarını takip edin." },
  { icon: Award, title: "Kaliteli Aday Havuzu", desc: "10.000+ aktif geliştirici arasından size en uygun yetenekleri bulun. Tüm adaylar doğrulanmış profillere sahip." },
  { icon: Shield, title: "Güvenli ve Gizli", desc: "Tüm verileriniz şifrelenmiş olarak saklanır. KVKK ve GDPR uyumlu platform ile güvenle çalışın." },
  { icon: Globe, title: "7/24 Erişim", desc: "Platformumuza istediğiniz zaman, istediğiniz yerden erişin. Mobil uyumlu arayüz ile her yerden yönetin." },
]

export function IsverenFeatures() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Özellikler
            </span>
            <h2 className="text-4xl font-bold mt-5 mb-4">Öne Çıkan Özellikler</h2>
            <p className="text-xl text-muted-foreground text-pretty">
              İşe alım süreçlerinizi kolaylaştıran güçlü araçlar.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <f.icon className="size-5 text-primary" />
                    </div>
                    <CardTitle>{f.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{f.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
