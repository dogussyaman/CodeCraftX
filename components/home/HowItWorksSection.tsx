"use client"

import { UserPlus, FileText, Sparkles, ArrowRight } from "lucide-react"
import { motion } from "motion/react"

const steps = [
  { step: "01", title: "Hesap Oluşturun", description: "Geliştirici veya İK olarak ücretsiz kaydolun, profilinizi tamamlayın", icon: UserPlus },
  { step: "02", title: "CV veya İlan Ekleyin", description: "Geliştiriciler CV yükler, İK uzmanları iş ilanı oluşturur", icon: FileText },
  { step: "03", title: "Eşleşmeleri Keşfedin", description: "Yapay zeka en uygun eşleşmeleri bulur, siz de iletişime geçin", icon: Sparkles },
]

export function HowItWorksSection() {
  return (
    <section id="nasil-calisir" className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5" />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-4 text-balance"
            >
              <span className="gradient-text">Nasıl Çalışır?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground"
            >
              Üç basit adımda başlayın ve fırsatları keşfedin
            </motion.p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
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
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <ArrowRight className="size-6 text-muted-foreground mx-auto" />
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
