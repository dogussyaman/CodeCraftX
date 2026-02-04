"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Users, Zap, BarChart3, Shield, Sparkles, Brain, Target } from "lucide-react"
import { motion } from "motion/react"

const features = [
  {
    icon: Brain,
    title: "Akıllı CV Analizi",
    description: "Yapay zeka ile CV'leri analiz eder, yetenekleri ve deneyim seviyelerini otomatik çıkarır",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Target,
    title: "Beceri Eşleştirme",
    description: "İş ilanları ile geliştirici profillerini otomatik eşleştirir, uyumluluk skorları hesaplar",
    gradient: "from-secondary/20 to-secondary/5",
  },
  {
    icon: Users,
    title: "İK Süreç Yönetimi",
    description: "Aday havuzu yönetimi, mülakat planlama ve HR iş akışları için profesyonel araçlar",
    gradient: "from-accent/20 to-accent/5",
  },
  {
    icon: BarChart3,
    title: "Performans Analitiği",
    description: "İşe alım performansını takip edin, headhunter verimliliğini raporlayın",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Shield,
    title: "Kurumsal Güvenlik",
    description: "SLA garantisi, RLS politikaları ve KVKK uyumlu veri saklama altyapısı",
    gradient: "from-secondary/20 to-secondary/5",
  },
  {
    icon: Zap,
    title: "Otomatik Filtreleme",
    description: "Binlerce aday arasından en uygun 10 adayı saniyeler içinde belirleyin",
    gradient: "from-accent/20 to-accent/5",
  },
]

export function FeaturesSection() {
  return (
    <section id="ozellikler" className="container mx-auto px-4 py-20 md:py-32">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary"
        >
          <Sparkles className="size-4" />
          <span>Güçlü Özellikler</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 text-4xl font-bold text-balance md:text-5xl"
        >
          Platform <span className="gradient-text">Özellikleri</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty"
        >
          Hem geliştiriciler hem de şirketler için tasarlanmış güçlü araçlar. Her ekip için ölçülebilir verimlilik.
        </motion.p>
      </div>

      <div className="grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mx-auto">
        {features.map((feature, idx) => (
          <AnimatedCard key={idx} delay={idx * 0.1}>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all h-full group">
              <CardContent className="p-6">
                <div
                  className={`size-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="size-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          </AnimatedCard>
        ))}
      </div>
    </section>
  )
}
