import { Award, Building2, Target, Users } from "lucide-react"

const stats = [
  { value: "10K+", label: "Aktif Geliştirici", icon: Users },
  { value: "500+", label: "İşveren Ortağımız", icon: Building2 },
  { value: "15K+", label: "Başarılı Eşleşme", icon: Target },
  { value: "%95", label: "Memnuniyet Oranı", icon: Award },
]

export function IsverenStats() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <stat.icon className="size-8" />
              </div>
              <div className="gradient-text mb-2 text-4xl font-bold md:text-5xl">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
