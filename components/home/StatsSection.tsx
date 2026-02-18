"use client"

import { motion } from "motion/react"

const STATS = [
  { value: "1.5K+", label: "Geliştirici ve tasarımcı" },
  { value: "500+", label: "Şirket" },
  { value: "10K+", label: "Eşleşme" },
]

export function StatsSection() {
  return (
    <section className="relative w-full py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16">
            {STATS.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="text-center"
              >
                <p className="text-3xl font-bold tracking-tight text-accent-600 dark:text-accent-400 sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
