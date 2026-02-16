"use client"

import { motion } from "motion/react"
import { Building2, FileText, MessageSquare, Users, Zap } from "lucide-react"

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
    title: "Hızlı Onay ve Kurulum",
    badge: "Hesabınız hazır",
    description: "Ekibimiz talebinizi hızla değerlendirir, şirket hesabınızı ve İK erişimlerinizi aktif eder.",
    icon: FileText,
  },
  {
    step: "03",
    title: "İlanınızı Yayınlayın",
    badge: "İş ilanı yayınla",
    description: "Pozisyon detaylarını girin, gereksinimleri belirleyin ve ilanınızı tek tıkla yayına alın.",
    icon: Zap,
  },
  {
    step: "04",
    title: "Başvuruları Yönetin",
    badge: "Süreci yönetin",
    description: "Yapay zekâ destekli eşleştirmelerle doğru geliştiricilere ulaşın, başvuruları tek panelden yönetin.",
    icon: Users,
  },
]

export function IsverenHowItWorks() {
  return (
    <section id="ozellikler" className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent-100/60 via-transparent to-accent-50/40 dark:from-accent-500/10" />
      <div className="relative container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center md:mb-16">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary md:text-sm"
            >
              İşveren yolculuğu
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="mb-4 text-balance text-3xl font-bold md:text-4xl lg:text-5xl"
            >
              <span className="gradient-text">Şirket olun, ilan verin,</span>
              <br className="hidden md:block" />
              <span className="text-foreground">en iyi geliştiricilerle eşleşin.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg"
            >
              Başvuru almadan önce bile sürecin her adımını şeffaf şekilde görmenizi sağlayan modern bir işveren akışı.
            </motion.p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {steps.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="rounded-2xl border border-accent-500/20 bg-white/75 p-5 shadow-sm backdrop-blur-xl dark:bg-zinc-900/60"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="inline-flex size-8 items-center justify-center rounded-full border border-accent-500/35 bg-accent-100 text-xs font-semibold text-accent-700 dark:bg-accent-500/15 dark:text-accent-200">
                    {item.step}
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                    <MessageSquare className="size-3" />
                    <span>{item.badge}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <item.icon className="mt-0.5 size-6 text-primary" />
                  <div>
                    <h3 className="mb-1 text-sm font-semibold md:text-base">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
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
