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
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary">
              Güven
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-5">Rakamlarla Codecrafters</h2>
            <p className="text-muted-foreground mt-3">
              Platformumuzun yarattığı etkiyi net verilerle görün.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
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
      </div>
    </section>
  )
}
