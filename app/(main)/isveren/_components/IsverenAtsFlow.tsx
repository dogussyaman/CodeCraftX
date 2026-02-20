"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"

const STEPS = [
  {
    id: 1,
    emoji: "📋",
    phase: "01",
    title: "İlan Yayınlandı",
    subtitle: "Job Posted",
    detail:
      "Şirket, gereksinim ve anahtar kelimelerle dolu detaylı bir iş ilanı oluşturur. Sistem bu ilan verisini ATS'e işler.",
    chips: ["Python", "3+ Yıl", "Remote", "Agile"],
    stat: { label: "Ortalama Başvuru", value: "247" },
  },
  {
    id: 2,
    emoji: "📨",
    phase: "02",
    title: "Başvuru Alındı",
    subtitle: "Application Received",
    detail:
      "Aday CV'sini ve ön yazısını sisteme yükler. Dosya format kontrolünden geçer ve kuyrukta yerini alır.",
    chips: ["PDF ✓", "DOC ✓", "< 5MB"],
    stat: { label: "Ortalama Süre", value: "< 2 dk" },
  },
  {
    id: 3,
    emoji: "⚙️",
    phase: "03",
    title: "ATS Ayrıştırma",
    subtitle: "Parsing Engine",
    detail:
      "NLP motoru CV'yi parçalara ayırır. Deneyim, eğitim, beceriler ve anahtar kelimeler çıkarılarak yapılandırılmış veriye dönüştürülür.",
    parse: true,
    chips: ["NLP", "Regex", "OCR", "Tokenize"],
    stat: { label: "İşlem Süresi", value: "1.3 sn" },
  },
  {
    id: 4,
    emoji: "🤖",
    phase: "04",
    title: "AI Puanlama",
    subtitle: "Scoring Engine",
    detail:
      "Makine öğrenmesi modeli adayı ilanla karşılaştırır. Semantik uyum, deneyim eşleşmesi ve beceri skoru hesaplanır.",
    score: 78,
    scoreBreakdown: [
      { label: "Beceri", v: 85 },
      { label: "Deneyim", v: 72 },
      { label: "Eğitim", v: 90 },
      { label: "Anahtar Kelime", v: 68 },
    ],
    stat: { label: "Eşleşme Oranı", value: "%82" },
  },
  {
    id: 5,
    emoji: "🎯",
    phase: "05",
    title: "Filtreleme",
    subtitle: "Threshold Gate",
    detail:
      "Puan eşiği kontrolü yapılır. Geçenler İK'ya iletilir; geçemeyenler otomatik bildirim alır. Bu aşamada adayların %80'i elenir.",
    chips: ["Eşik: 70 ✓", "Skor: 78 ✓", "İletiyor →"],
    stat: { label: "Eleme Oranı", value: "%80" },
  },
  {
    id: 6,
    emoji: "👤",
    phase: "06",
    title: "İK İncelemesi",
    subtitle: "Human Review",
    detail:
      "Kısa listedeki adaylar İK uzmanı tarafından incelenir. Uygun görülenler mülakat davetleri ile sürece dahil edilir.",
    chips: ["Shortlist", "Mülakat", "Teklif"],
    stat: { label: "Mülakat Oranı", value: "%5" },
  },
]

function ParseTerminal() {
  const lines = [
    { t: 0, c: "text-muted-foreground", txt: "$ ats-parser --input cv.pdf" },
    { t: 0.5, c: "text-muted-foreground/80", txt: "> Dosya okunuyor..." },
    { t: 1.0, c: "text-accent-500", txt: "✦ AD: Ahmet Yılmaz" },
    { t: 1.4, c: "text-accent-500", txt: "✦ DENEYİM: 4 yıl → ✓ (min: 3)" },
    { t: 1.8, c: "text-accent-500", txt: "✦ BECERİLER: Python, SQL, Git" },
    { t: 2.2, c: "text-accent-500", txt: "✦ EĞİTİM: BSc Bilgisayar Müh." },
    { t: 2.6, c: "text-primary", txt: "✅ Parse tamamlandı — 4 alan" },
  ]
  return (
    <div className="mt-4 rounded-xl border border-accent-500/20 bg-muted/50 p-3 font-mono text-xs leading-relaxed dark:bg-background/80">
      {lines.map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: l.t, duration: 0.3 }}
          className={l.c}
        >
          {l.txt}
        </motion.div>
      ))}
    </div>
  )
}

function ScoreBars({
  items,
}: {
  items: { label: string; v: number }[]
}) {
  return (
    <div className="mt-4 flex flex-col gap-2.5">
      {items.map((item, i) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between font-mono text-xs text-muted-foreground">
            <span>{item.label}</span>
            <span className="font-bold text-accent-600 dark:text-accent-400">
              {item.v}
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.v}%` }}
              transition={{
                delay: i * 0.1 + 0.15,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="h-full rounded-full bg-linear-to-r from-accent-500 to-accent-400/80"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function Ring({ score }: { score: number }) {
  const [cur, setCur] = useState(0)
  useEffect(() => {
    const dur = 1300
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      setCur(Math.round(p * score))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score])
  const r = 34
  const circ = 2 * Math.PI * r
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center">
      <svg width={90} height={90} viewBox="0 0 90 90">
        <circle
          cx={45}
          cy={45}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          className="text-muted/40"
        />
        <circle
          cx={45}
          cy={45}
          r={r}
          fill="none"
          stroke="url(#ring-accent)"
          strokeWidth={6}
          strokeDasharray={circ}
          strokeDashoffset={circ - (cur / 100) * circ}
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
          className="transition-[stroke-dashoffset] duration-40 ease-linear drop-shadow-[0_0_8px_var(--theme-accent-500)]"
        />
        <defs>
          <linearGradient id="ring-accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--theme-accent-500)" />
            <stop offset="100%" stopColor="var(--theme-accent-400)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <div className="text-lg font-extrabold leading-none text-accent-600 dark:text-accent-400">
          {cur}
        </div>
        <div className="mt-0.5 font-mono text-[9px] text-muted-foreground">
          /100
        </div>
      </div>
    </div>
  )
}

export function IsverenAtsFlow() {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const step = STEPS[active]

  useEffect(() => {
    if (!auto) return
    timerRef.current = setInterval(
      () => setActive((p) => (p + 1) % STEPS.length),
      2700
    )
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [auto])

  const pick = (i: number) => {
    setActive(i)
    setAuto(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  return (
    <section
      id="ats-nasil-isliyor"
      className="relative overflow-hidden py-20 md:py-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-accent-500/5 via-transparent to-accent-500/5" />
      <div className="relative container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center md:mb-14"
        >
          <span className="mb-3 inline-block rounded-full border border-accent-500/30 bg-accent-500/10 px-4 py-1.5 text-xs font-semibold text-accent-700 dark:text-accent-200">
            Başvurunuza ne oldu?
          </span>
          <h2 className="text-balance text-2xl font-bold md:text-3xl lg:text-4xl">
            <span className="gradient-text">ATS</span>
            <span className="text-foreground">
              {" "}
              sistemi ve yapay zekanın bir CV'yi nasıl işlediğini keşfedin
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
            İlan yayınından İK incelemesine kadar tüm adımlar; timeline üzerinden
            tıklayarak veya otomatik oynatma ile inceleyin.
          </p>
        </motion.div>

        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setAuto((p) => !p)}
              className="rounded-md border border-accent-500/25 bg-accent-500/5 px-3.5 py-1.5 font-mono text-[10px] tracking-wide text-accent-600 transition-colors hover:bg-accent-500/10 dark:border-accent-500/20 dark:text-accent-300"
            >
              {auto ? "⏸ AUTO" : "▶ PLAY"}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr] md:gap-8">
            {/* Sol: Timeline – çizgi yanda, node'ların üzerine gelmez */}
            <div className="order-2 flex gap-3 md:order-1">
              {/* Dikey çizgi kolonu: tam solda, yapıların yanında */}
              <div className="relative w-1 shrink-0">
                <div
                  className="absolute left-1/2 top-9 bottom-9 z-0 w-px -translate-x-1/2 bg-border"
                  aria-hidden
                />
                <motion.div
                  animate={{ height: `${(active / (STEPS.length - 1)) * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-1/2 top-9 z-10 w-px -translate-x-1/2 origin-top rounded-full bg-linear-to-b from-accent-500 to-accent-500/20 shadow-[0_0_8px_var(--theme-accent-500)]"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="relative z-20 flex flex-col gap-0.5">
                {STEPS.map((s, i) => {
                  const isActive = active === i
                  const isDone = i < active
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.5 }}
                    >
                      <button
                        type="button"
                        onClick={() => pick(i)}
                        className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all hover:bg-muted/50 ${
                          isActive
                            ? "border-accent-500/30 bg-accent-500/10 dark:border-accent-500/25"
                            : "border-transparent"
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm transition-all ${
                            isActive
                              ? "border-accent-500 bg-accent-500/20 text-accent-600 shadow-[0_0_14px_var(--theme-accent-500)] dark:text-accent-300"
                              : isDone
                                ? "border-accent-500/40 bg-muted/50 text-accent-600 dark:text-accent-400"
                                : "border-border bg-muted/30 text-muted-foreground"
                          }`}
                        >
                          {isDone ? (
                            <span className="text-xs text-accent-600 dark:text-accent-400">
                              ✓
                            </span>
                          ) : (
                            <span
                              className={
                                isActive ? "" : "opacity-50 grayscale"
                              }
                            >
                              {s.emoji}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`truncate text-sm font-bold ${
                              isActive
                                ? "text-foreground"
                                : isDone
                                  ? "text-muted-foreground"
                                  : "text-muted-foreground/70"
                            }`}
                          >
                            {s.title}
                          </div>
                          <div className="mt-0.5 font-mono text-[9px] text-muted-foreground">
                            {s.subtitle}
                          </div>
                        </div>
                        {isActive && (
                          <motion.div
                            layoutId="ats-pip"
                            className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500 shadow-[0_0_6px_var(--theme-accent-500)]"
                          />
                        )}
                      </button>
                    </motion.div>
                  )
                })}
                </div>

                {/* Progress bar: steps ile aynı sütunda, çizginin yanında */}
                <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3">
                <div className="mb-1.5 flex justify-between font-mono text-[9px] text-muted-foreground">
                  <span>PROGRESS</span>
                  <motion.span
                    key={active}
                    className="font-bold text-accent-600 dark:text-accent-400"
                  >
                    {Math.round(((active + 1) / STEPS.length) * 100)}%
                  </motion.span>
                </div>
                <div className="flex gap-1">
                  {STEPS.map((s, i) => (
                    <motion.button
                      key={s.id}
                      type="button"
                      onClick={() => pick(i)}
                      animate={{
                        backgroundColor:
                          i <= active
                            ? "var(--theme-accent-500)"
                            : "hsl(var(--muted))",
                        boxShadow:
                          i === active
                            ? "0 0 6px var(--theme-accent-500)"
                            : "none",
                        scaleY: i === active ? 1.4 : 1,
                      }}
                      transition={{ duration: 0.35 }}
                      className="h-1 flex-1 cursor-pointer rounded-full origin-center"
                    />
                  ))}
                </div>
                </div>
              </div>
            </div>

            {/* Sağ: Detay panel */}
            <div className="order-1 md:order-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 24, scale: 0.975 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -24, scale: 0.975 }}
                  transition={{
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative overflow-hidden rounded-2xl border border-accent-500/20 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:bg-zinc-900/70 dark:border-accent-500/15"
                >
                  <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-accent-500/20 blur-3xl" />
                  <div className="relative">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-accent-500/25 bg-accent-500/10 px-2.5 py-1">
                          <span className="text-sm">{step.emoji}</span>
                          <span className="font-mono text-[9px] font-medium tracking-wide text-accent-600 dark:text-accent-300">
                            PHASE {step.phase}
                          </span>
                        </div>
                        <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                          {step.title}
                        </h3>
                        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                          {step.subtitle}
                        </p>
                      </div>
                      {step.score != null && <Ring score={step.score} />}
                    </div>

                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                      {step.detail}
                    </p>

                    {step.parse && <ParseTerminal />}
                    {"scoreBreakdown" in step && step.scoreBreakdown && (
                      <ScoreBars items={step.scoreBreakdown} />
                    )}

                    {step.chips && !("parse" in step && step.parse) && (
                      <div className="flex flex-wrap gap-2">
                        {step.chips.map((c, i) => (
                          <motion.span
                            key={c}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.06 }}
                            className="rounded-full border border-accent-500/25 bg-accent-500/10 px-3 py-1 font-mono text-[10px] text-accent-600 dark:text-accent-300"
                          >
                            {c}
                          </motion.span>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {step.stat.label}
                      </span>
                      <motion.span
                        key={step.stat.value}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl font-extrabold tracking-tight text-accent-600 dark:text-accent-400"
                      >
                        {step.stat.value}
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Alt istatistikler */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {[
              {
                label: "Ortalama ATS Eşiği",
                value: "70 / 100",
                color: "text-amber-500",
              },
              {
                label: "İnsan İnceleme Oranı",
                value: "~%20",
                color: "text-accent-500",
              },
              {
                label: "Otomasyon Hızı",
                value: "< 2 sn",
                color: "text-emerald-500",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-muted/30 p-4 text-center"
              >
                <div
                  className={`text-xl font-extrabold tracking-tight ${s.color}`}
                >
                  {s.value}
                </div>
                <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
