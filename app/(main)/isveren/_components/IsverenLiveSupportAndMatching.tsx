"use client"

import { motion } from "motion/react"
import { BadgeCheck, Headset, MousePointer2, Sparkles, Target, Workflow } from "lucide-react"

const LIVE_CURSOR_BADGES = [
  {
    id: "support-hr",
    label: "İK Canlı Destek",
    pill: "Anında yanıt",
    top: "top-5",
    left: "left-4",
    delay: 0,
  },
  {
    id: "support-dev",
    label: "Geliştirici",
    pill: "Soru soruyor",
    top: "top-28",
    left: "left-24",
    delay: 0.25,
  },
] as const

const MATCHING_BLIPS = [
  { id: "cv-1", label: "CV Skoru 86", ringDelay: 0, badgePos: "right-[18%] top-[14%]" },
  { id: "cv-2", label: "Skill Match 92", ringDelay: 0.7, badgePos: "left-[20%] bottom-[18%]" },
  { id: "cv-3", label: "Pipeline'a alındı", ringDelay: 1.4, badgePos: "right-[24%] bottom-[32%]" },
] as const

export function IsverenLiveSupportAndMatching() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-accent-100/40 via-transparent to-accent-50/30 dark:from-accent-500/10" />

      <div className="relative container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-4 text-center md:mb-14">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary md:text-sm"
            >
              <Sparkles className="size-3.5" />
              <span>Canlı destek ve akıllı eşleşme</span>
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl"
            >
              <span className="gradient-text">Gerçek zamanlı destek,</span>
              <br className="hidden md:block" />
              <span className="text-foreground">AI destekli CV analiziyle birleşiyor.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base"
            >
              İK ekibiniz geliştiricilerle canlı olarak etkileşimde kalırken, arka planda CV&apos;ler analiz edilir,
              başvurular skorlanır ve pozisyonlarınıza en uygun adaylar otomatik olarak öne çıkarılır.
            </motion.p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sol kart – canlı destek */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="relative overflow-hidden rounded-2xl border border-accent-500/25 bg-white/80 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:bg-zinc-950/80"
            >
              <div className="pointer-events-none absolute -inset-10 -z-10 bg-[radial-gradient(circle_at_top_left,var(--color-accent-500),transparent_55%)]/[30] dark:bg-[radial-gradient(circle_at_top_left,var(--color-accent-400),transparent_60%)]/[40]" />

              <div className="mb-4 flex items-center gap-2 text-xs font-medium text-accent-700 dark:text-accent-200">
                <div className="inline-flex size-8 items-center justify-center rounded-full bg-accent-500/10 text-accent-700 dark:bg-accent-500/20 dark:text-accent-100">
                  <Headset className="size-4" />
                </div>
                <span className="rounded-full bg-accent-100/70 px-2.5 py-1 text-[11px] font-semibold text-accent-800 dark:bg-accent-500/15 dark:text-accent-100">
                  Canlı İK desteği
                </span>
              </div>

              <h3 className="mb-2 text-base font-semibold md:text-lg">Panelden ayrılmadan canlı destek</h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                İK ekibi, geliştiricilerle aynı panel üzerinden mesajlaşabilir, soruları yanıtlayabilir ve başvurular
                üzerindeki aksiyonları canlı olarak koordine edebilir.
              </p>

              <div className="mb-4 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                  <BadgeCheck className="size-3" />
                  7/24 destek akışı
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
                  <Workflow className="size-3" />
                  Sürece bağlı mesajlaşma
                </span>
              </div>

              <div className="relative mt-3 h-52 overflow-hidden rounded-xl border border-accent-500/25 bg-linear-to-b from-zinc-950 via-zinc-950/95 to-zinc-950/90 p-4 text-xs text-zinc-100">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(250,250,250,0.12)_1px,transparent_0)] bg-size-[18px_18px] opacity-30" />

                <p className="relative mb-3 text-[11px] text-zinc-300">
                  İK panelinizde, geliştirici ile açtığınız sohbetler; ilan, başvuru ve görüşme kaydıyla otomatik
                  ilişkilendirilir. Böylece hiçbir detay kaybolmaz.
                </p>

                <div className="relative mt-2 h-32">
                  {LIVE_CURSOR_BADGES.map((cursor, idx) => (
                    <motion.div
                      key={cursor.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{
                        opacity: [0.2, 1, 0.8, 1],
                        y: [6, 0, -4, 0],
                      }}
                      transition={{
                        duration: 5 + idx * 0.5,
                        delay: cursor.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatType: "mirror",
                      }}
                      className={`absolute ${cursor.top} ${cursor.left} flex items-center gap-2 rounded-full border border-accent-500/40 bg-zinc-900/80 px-2.5 py-1.5 text-[11px] shadow-lg backdrop-blur`}
                    >
                      <span className="inline-flex size-5 items-center justify-center rounded-full bg-accent-500/20 text-accent-200">
                        <MousePointer2 className="size-3" />
                      </span>
                      <div className="flex flex-col">
                        <span className="font-semibold">{cursor.label}</span>
                        <span className="text-[10px] text-zinc-300">{cursor.pill}</span>
                      </div>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: [0, 1, 1, 0], x: [10, 0, 0, 10] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-2 right-2 max-w-[180px] rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-100 shadow-lg"
                  >
                    <span className="font-semibold">Canlı destek notu:</span>{" "}
                    <span className="text-emerald-50/90">
                      Aday soruları ve İK cevapları, başvuru kartında tek bakışta görülebilir.
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Sağ kart – CV analizi ve eşleştirme */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="relative overflow-hidden rounded-2xl border border-accent-500/25 bg-white/80 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:bg-zinc-950/80"
            >
              <div className="pointer-events-none absolute -inset-10 -z-10 bg-[radial-gradient(circle_at_bottom_right,var(--color-accent-500),transparent_55%)]/[30] dark:bg-[radial-gradient(circle_at_bottom_right,var(--color-accent-400),transparent_60%)]/[40]" />

              <div className="mb-4 flex items-center gap-2 text-xs font-medium text-accent-700 dark:text-accent-200">
                <div className="inline-flex size-8 items-center justify-center rounded-full bg-accent-500/10 text-accent-700 dark:bg-accent-500/20 dark:text-accent-100">
                  <Target className="size-4" />
                </div>
                <span className="rounded-full bg-accent-100/70 px-2.5 py-1 text-[11px] font-semibold text-accent-800 dark:bg-accent-500/15 dark:text-accent-100">
                  AI destekli eşleştirme
                </span>
              </div>

              <h3 className="mb-2 text-base font-semibold md:text-lg">Analiz edilen CV&apos;ler, akıllı eşleşmeler</h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                Her başvuru; teknoloji yığını, deneyim seviyesi ve ilan gereksinimlerine göre analiz edilir. Sistem,
                en uygun adayları otomatik olarak önceliklendirir.
              </p>

              <div className="mb-4 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-1 text-purple-700 dark:bg-purple-500/15 dark:text-purple-200">
                  AI skorlama
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-1 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200">
                  Stack ve skill eşleşme
                </span>
              </div>

              <div className="relative mt-3 flex items-center justify-center">
                <div className="relative h-56 w-56">
                  <div className="absolute inset-0 rounded-full border border-accent-500/20" />
                  <div className="absolute inset-5 rounded-full border border-accent-500/25" />
                  <div className="absolute inset-10 rounded-full border border-accent-500/30" />
                  <div className="absolute inset-16 rounded-full border border-accent-500/40" />

                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                  >
                    <div className="absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2 origin-bottom bg-linear-to-b from-accent-400 via-accent-500/90 to-transparent" />
                  </motion.div>

                  {MATCHING_BLIPS.map((blip, idx) => (
                    <div key={blip.id} className="absolute inset-0">
                      <motion.div
                        initial={{ opacity: 0.2, scale: 0.9 }}
                        animate={{ opacity: [0.2, 0.9, 0], scale: [0.9, 1.1, 1.2] }}
                        transition={{
                          duration: 3.2,
                          delay: blip.ringDelay,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                        className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-400/70 bg-accent-500/10"
                      />
                    </div>
                  ))}

                  <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-950 text-center text-[11px] text-zinc-100 shadow-[0_0_40px_rgba(15,23,42,0.9)]">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] text-zinc-400">Öncelikli adaylar</span>
                      <span className="text-lg font-semibold text-accent-300">5</span>
                    </div>
                  </div>

                  {MATCHING_BLIPS.map((blip, idx) => (
                    <motion.div
                      key={blip.id + "-badge"}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: [0, 1, 1, 0], y: [4, 0, 0, 4] }}
                      transition={{
                        duration: 4.5,
                        delay: 0.4 + idx * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className={`absolute ${blip.badgePos} max-w-[150px] rounded-xl border border-accent-500/25 bg-zinc-900/90 px-3 py-1.5 text-[11px] text-zinc-100 shadow-lg backdrop-blur`}
                    >
                      {blip.label}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

