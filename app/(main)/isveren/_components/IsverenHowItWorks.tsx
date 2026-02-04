import { FileText, Zap, Users, MessageSquare, ArrowRight } from "lucide-react"

const steps = [
  { step: "01", title: "İlan Oluşturun", description: "İş tanımınızı, gereksinimlerinizi ve tercihlerinizi belirtin", icon: FileText },
  { step: "02", title: "Otomatik Eşleştirme", description: "Yapay zeka algoritmamız size en uygun adayları bulur", icon: Zap },
  { step: "03", title: "Adayları İnceleyin", description: "Eşleşen adayların CV'lerini ve profillerini detaylı inceleyin", icon: Users },
  { step: "04", title: "İletişime Geçin", description: "Beğendiğiniz adaylarla doğrudan iletişime geçin ve görüşme ayarlayın", icon: MessageSquare },
]

export function IsverenHowItWorks() {
  return (
    <section id="ozellikler" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary">
              Süreç
            </span>
            <h2 className="text-4xl font-bold mt-5 mb-4">Nasıl Çalışır?</h2>
            <p className="text-xl text-muted-foreground">Basit ve etkili işe alım süreci.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((item, idx) => (
              <div key={idx} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">
                    {item.step}
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 mb-4">
                    <item.icon className="size-8 text-primary mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <ArrowRight className="size-6 text-muted-foreground mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
