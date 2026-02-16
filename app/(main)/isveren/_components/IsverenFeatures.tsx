import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Building2, Globe, Shield, Target, Users } from "lucide-react"

const features = [
  {
    icon: Building2,
    title: "Şirket Profili Yönetimi",
    desc: "Şirket profilinizi oluşturun, logo ve bilgilerinizi güncelleyin. Marka kimliğinizi güçlü şekilde yansıtın.",
  },
  {
    icon: Target,
    title: "Hedefli İlan Yayınlama",
    desc: "İlanlarınızı doğru adaylara ulaştırın. Yapay zekâ motoru ilanınızı uygun geliştiricilere önerir.",
  },
  {
    icon: Users,
    title: "Başvuru Yönetimi",
    desc: "Tüm başvuruları tek yerden yönetin. Adayları filtreleyin, sıralayın ve süreç durumlarını takip edin.",
  },
  {
    icon: Award,
    title: "Kaliteli Aday Havuzu",
    desc: "10.000+ aktif geliştirici arasından en uygun yetenekleri bulun. Profiller doğrulanmış ve günceldir.",
  },
  {
    icon: Shield,
    title: "Güvenli ve Gizli",
    desc: "Verileriniz şifrelenmiş olarak saklanır. KVKK uyumlu altyapı ile güvenle işe alım yapın.",
  },
  {
    icon: Globe,
    title: "7/24 Erişim",
    desc: "Platforma istediğiniz zaman, istediğiniz yerden erişin. Mobil uyumlu arayüzle ekibinizi yönetin.",
  },
]

export function IsverenFeatures() {
  return (
    <section className="bg-muted/20 py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">Özellikler</h2>
            <p className="text-xl text-muted-foreground">İşe alımı kolaylaştıran güçlü araçlar</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((item) => (
              <Card key={item.title} className="border border-accent-500/20 bg-white/75 dark:bg-zinc-900/60">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <item.icon className="size-5 text-primary" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{item.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
