"use client"

import { Building2, FileText, Zap, Users, MessageSquare } from "lucide-react"
import { motion } from "motion/react"

const steps = [
  {
    step: "01",
    title: "Şirket Talebi Oluşturun",
    badge: "Şirket ol",
    description: "Kısa formu doldurarak şirket bilgilerinizi iletin, ekibinizi ve ihtiyaçlarınızı tanımlayın.",
    icon: Building2,
  },
  {
    step: "02",
    title: "Hızlı Onay & Kurulum",
    badge: "Hesabınız hazır",
    description: "Ekibimiz talebinizi hızla değerlendirir, şirket hesabınızı ve İK erişimlerinizi aktif eder.",
    icon: FileText,
  },
  {
    step: "03",
    title: "İlk İlanınızı Yayınlayın",
    badge: "İş ilanı yayınla",
    description: "Pozisyon detaylarını girin, gereksinimlerinizi tanımlayın ve ilanınızı tek tıkla yayına alın.",
    icon: Zap,
  },
  {
    step: "04",
    title: "Başvuruları ve Eşleşmeleri Yönetin",
    badge: "Süreci yönetin",
    description: "Yapay zeka destekli eşleştirmelerle doğru geliştiricilere ulaşın, başvuruları tek panelden yönetin.",
    icon: Users,
  },
]

export function IsverenHowItWorks() {
  return (
    <section id="ozellikler" className="relative py-20 md:py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/5 via-background to-secondary/5" />

      <div className="relative container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-medium mb-4"
            >
              İşveren yolculuğu
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance"
            >
              <span className="gradient-text">Şirket olun, ilan verin,</span>
              <br className="hidden md:block" />
              <span className="text-foreground"> en iyi geliştiricilerle eşleşin.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Başvuru almadan önce bile sürecin her adımını şeffaf şekilde görmenizi sağlayan modern bir işveren akışı.
            </motion.p>
          </div>

          {/* Masaüstü: animasyonlu adım akışı */}
          <div className="hidden md:block mb-10">
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute top-10 left-8 right-8 h-px bg-linear-to-r from-primary/20 via-primary/40 to-secondary/40" />

              <div className="grid grid-cols-4 gap-6">
                {steps.map((item, idx) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: idx * 0.1 }}
                    className="relative flex flex-col items-center text-center group"
                  >
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center size-10 rounded-full bg-background border border-primary/30 text-xs font-semibold text-primary shadow-sm group-hover:shadow-primary/20 group-hover:-translate-y-0.5 transition-all">
                        {item.step}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-card/80 border border-border/60 shadow-sm group-hover:border-primary/60 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-300 backdrop-blur-sm">
                      <div className="inline-flex items-center gap-2 text-[11px] font-medium text-primary/80 bg-primary/10 rounded-full px-3 py-1 mb-3">
                        <MessageSquare className="size-3" />
                        <span>{item.badge}</span>
                      </div>

                      <item.icon className="size-8 text-primary mx-auto mb-3" />
                      <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobil: dikey kartlar */}
          <div className="md:hidden space-y-4">
            {steps.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="relative flex gap-3"
              >
                  <div className="flex flex-col items-center mt-2">
                  <div className="inline-flex items-center justify-center size-8 rounded-full bg-background border border-primary/40 text-[11px] font-semibold text-primary">
                    {item.step}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="flex-1 w-px bg-linear-to-b from-primary/40 via-primary/20 to-transparent mt-1" />
                  )}
                </div>

                <div className="flex-1 p-4 rounded-2xl bg-card/90 border border-border/70 shadow-sm">
                  <div className="inline-flex items-center gap-2 text-[11px] font-medium text-primary/80 bg-primary/10 rounded-full px-3 py-1 mb-2">
                    <MessageSquare className="size-3" />
                    <span>{item.badge}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <item.icon className="size-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
