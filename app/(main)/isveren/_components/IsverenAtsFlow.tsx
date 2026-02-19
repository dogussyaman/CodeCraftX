"use client"

import { motion } from "motion/react"
import { FileSearch, Sparkles, BarChart3, ArrowUpCircle, GitBranch } from "lucide-react"

const ATS_STEPS = [
  {
    id: "cv",
    label: "CV Girişi",
    description: "Başvurular tek panelde toplanır",
    icon: FileSearch,
  },
  {
    id: "analiz",
    label: "AI Analiz",
    description: "Tech stack, deneyim, ilan eşleşmesi",
    icon: Sparkles,
  },
  {
    id: "skor",
    label: "Skorlama",
    description: "CV Skoru ve Skill Match hesaplanır",
    icon: BarChart3,
  },
  {
    id: "oncelik",
    label: "Önceliklendirme",
    description: "En uygun adaylar otomatik öne çıkar",
    icon: ArrowUpCircle,
  },
  {
    id: "pipeline",
    label: "Pipeline",
    description: "Adaylar sürece otomatik yerleşir",
    icon: GitBranch,
  },
] as const

/** Arka planda hareket eden noktalar – ATS işleyişini hissettiren animasyon */
function AnimatedGridBackdrop() {
  const dots = Array.from({ length: 48 }, (_, i) => ({
    id: i,
    row: Math.floor(i / 8),
    col: i % 8,
    delay: (i % 5) * 0.4,
    duration: 3 + (i % 4) * 0.8,
  }))

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Yumuşak gradient katmanları */}
      <div
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 20% 40%, var(--color-accent-500) 0%, transparent 50%), radial-gradient(ellipse 60% 60% at 80% 60%, var(--color-accent-400) 0%, transparent 45%)",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--background)_85%)]" />

      {/* Hareketli nokta grid */}
      <div className="absolute inset-0 flex flex-wrap justify-center gap-[6%] px-[8%] py-[12%] sm:gap-[5%] md:gap-[4%]">
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            className="size-1.5 rounded-full bg-accent-500/40 dark:bg-accent-400/30 sm:size-2"
            initial={{ opacity: 0.2, scale: 0.8 }}
            animate={{
              opacity: [0.2, 0.7, 0.3, 0.2],
              scale: [0.8, 1.2, 1, 0.8],
            }}
            transition={{
              duration: dot.duration,
              delay: dot.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Akış çizgisi hissi – soldan sağa hareket eden ışık */}
      <motion.div
        className="absolute top-1/2 h-px w-1/3 -translate-y-1/2 rounded-full bg-linear-to-r from-transparent via-accent-500/30 to-transparent"
        initial={{ x: "-10%" }}
        animate={{ x: "110%" }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

export function IsverenAtsFlow() {
  return (
    <section id="ats-nasil-isliyor" className="relative overflow-hidden py-20 md:py-28">
      <AnimatedGridBackdrop />

      <div className="relative container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center md:mb-16"
          >
            <span className="mb-3 inline-block rounded-full border border-accent-500/30 bg-accent-500/10 px-4 py-1.5 text-xs font-semibold text-accent-700 dark:text-accent-200">
              ATS Nasıl İşliyor?
            </span>
            <h2 className="text-balance text-2xl font-bold md:text-3xl lg:text-4xl">
              <span className="gradient-text">Arka planda</span>
              <span className="text-foreground"> başvurular analiz edilir, skorlanır ve pipeline&apos;a alınır</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
              CV&apos;ler ilan gereksinimleriyle eşleştirilir; en uygun adaylar otomatik öncelik kazanır. İK ekibi tek ekrandan tüm süreci takip eder.
            </p>
          </motion.div>

          {/* Adım kartları + aralarında animasyonlu bağlantı */}
          <div className="relative">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {ATS_STEPS.map((step, idx) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="relative"
                >
                  <div className="relative rounded-2xl border border-accent-500/20 bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:bg-zinc-900/70 dark:border-accent-500/15">
                    <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-accent-500/15 text-accent-600 dark:bg-accent-500/20 dark:text-accent-300">
                      <step.icon className="size-5" />
                    </div>
                    <h3 className="mb-1 font-semibold text-foreground">{step.label}</h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">{step.description}</p>

                    {/* Adım numarası */}
                    <div className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-accent-500/20 text-[10px] font-bold text-accent-700 dark:text-accent-200">
                      {idx + 1}
                    </div>
                  </div>

                  {/* Adımlar arası ok (masaüstünde) */}
                  {idx < ATS_STEPS.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, pathLength: 0 }}
                      whileInView={{ opacity: 1, pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 + idx * 0.08 }}
                      className="absolute -right-4 top-1/2 hidden -translate-y-1/2 lg:block"
                    >
                      <motion.svg
                        width="32"
                        height="24"
                        viewBox="0 0 32 24"
                        fill="none"
                        className="text-accent-500/50"
                      >
                        <motion.path
                          d="M0 12 L24 12 M20 8 L26 12 L20 16"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.5 + idx * 0.1 }}
                        />
                      </motion.svg>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Alt bilgi: canlı metrikler örneği */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4 rounded-xl border border-accent-500/15 bg-accent-500/5 px-4 py-3 text-center dark:bg-accent-500/10"
            >
              <span className="text-xs font-medium text-muted-foreground md:text-sm">
                Örnek çıktılar: <strong className="text-foreground">CV Skoru 86</strong>,{" "}
                <strong className="text-foreground">Skill Match %92</strong>,{" "}
                <strong className="text-foreground">Öncelikli aday 5</strong>, Pipeline&apos;a alındı
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
