import { Users, Building2, Target, Award } from "lucide-react"

const stats = [
  { value: "10K+", label: "Aktif Geliştirici", icon: Users },
  { value: "500+", label: "Şirket Ortağımız", icon: Building2 },
  { value: "15K+", label: "Başarılı Eşleşme", icon: Target },
  { value: "95%", label: "Memnuniyet Oranı", icon: Award },
]

export function IsverenStats() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary mb-4">
                <stat.icon className="size-8" />
              </div>
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
