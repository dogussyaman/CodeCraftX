"use client"

import { AnimatedCard } from "@/components/animated-card"
import { motion } from "motion/react"
import { BarChart3, Brain, Shield, Sparkles, Target, Users, Zap } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Akıllı CV Analizi",
    description: "Yapay zeka CV içeriğini analiz eder, yetenekleri ve deneyim seviyesini otomatik çıkarır.",
    gradient: "from-accent-500/25 via-accent-400/15 to-transparent",
  },
  {
    icon: Target,
    title: "Beceri Eşleştirme",
    description: "İlanlar ile geliştirici profilleri arasında uyum skoru oluşturur ve adayı sıralar.",
    gradient: "from-accent-400/25 via-accent-500/15 to-transparent",
  },
  {
    icon: Users,
    title: "İK Süreç Yönetimi",
    description: "Aday havuzu, mülakat adımları ve ekip içi koordinasyonu tek panelde toplar.",
    gradient: "from-accent-500/25 via-accent-500/15 to-transparent",
  },
  {
    icon: BarChart3,
    title: "Performans Analitiği",
    description: "İşe alım performansını takip edin, süreç darboğazlarını net şekilde görün.",
    gradient: "from-accent-500/25 via-accent-500/10 to-transparent",
  },
  {
    icon: Shield,
    title: "Kurumsal Güvenlik",
    description: "KVKK uyumlu altyapı, güvenli erişim katmanı ve rol bazlı yetkilendirme.",
    gradient: "from-accent-500/20 via-zinc-500/10 to-transparent",
  },
  {
    icon: Zap,
    title: "Otomatik Filtreleme",
    description: "Yüzlerce aday arasından en uygun profilleri saniyeler içinde öne çıkarır.",
    gradient: "from-accent-500/25 via-accent-400/15 to-transparent",
  },
]

export function FeaturesSection() {
  return (
    <section id="ozellikler" className="container mx-auto px-4 py-20 md:py-32">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-100/70 px-4 py-2 text-sm font-medium text-accent-900 dark:bg-accent-500/10 dark:text-accent-200"
        >
          <Sparkles className="size-4" />
          <span>Güçlü Özellikler</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 text-4xl font-bold text-foreground md:text-5xl"
        >
          Platformu modern yapan{" "}
          <span className="inline-block whitespace-nowrap bg-gradient-to-r from-accent-500 to-accent-400 bg-clip-text text-transparent">
            çekirdek yetenekler
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-lg text-muted-foreground"
        >
          Tüm ana sayfa deneyimi aynı renk dili ve modern kart sistemi ile çalışır.
        </motion.p>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, idx) => (
          <AnimatedCard key={feature.title} delay={idx * 0.08}>
            <div className="group h-full overflow-hidden rounded-xl border border-accent-500/15 bg-white/70 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-accent-500/40 hover:shadow-xl hover:shadow-accent-500/10 dark:bg-zinc-900/60">
              <div className={`mb-4 flex size-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient}`}>
                <feature.icon className="size-7 text-accent-600 dark:text-accent-300" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground transition-colors group-hover:text-accent-600 dark:group-hover:text-accent-300">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </section>
  )
}
