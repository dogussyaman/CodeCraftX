"use client"

import { motion } from "motion/react"
import { ArrowRight, FileText, Sparkles, UserPlus } from "lucide-react"

const steps = [
  {
    step: "01",
    title: "Hesap Oluştur",
    description: "Geliştirici veya İK olarak kaydol, profilini dakikalar içinde tamamla.",
    icon: UserPlus,
  },
  {
    step: "02",
    title: "CV veya İlan Ekle",
    description: "Adaylar CV yükler, ekipler ilan açarak net beklenti seti oluşturur.",
    icon: FileText,
  },
  {
    step: "03",
    title: "Adayları Eşleştir",
    description: "Akıllı motor en uygun eşleşmeleri öne çıkarır, süreç hızla ilerler.",
    icon: Sparkles,
  },
]

export function HowItWorksSection() {
  return (
    <section id="nasil-calisir" className="relative overflow-hidden py-20 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent-100/70 via-transparent to-accent-50/60 dark:from-accent-500/10 dark:to-transparent" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-foreground md:text-5xl"
            >
              3 adımda
              <span className="block bg-gradient-to-r from-accent-500 to-accent-400 bg-clip-text text-transparent">
                modern işe alım akışı
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
            >
              Süreç sade, görünür ve hızlı kalır. Tüm adımlar tek tasarım dilinde ilerler.
            </motion.p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <div className="rounded-2xl border border-accent-500/20 bg-white/70 p-6 text-center backdrop-blur-xl dark:bg-zinc-900/60">
                  <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-accent-400 text-sm font-bold text-white">
                    {item.step}
                  </div>
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-xl bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300">
                    <item.icon className="size-7" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="absolute left-full top-1/2 hidden -translate-y-1/2 px-2 md:block">
                    <ArrowRight className="size-5 text-accent-400/80" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
