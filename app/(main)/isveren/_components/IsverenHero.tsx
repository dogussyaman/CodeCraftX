"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, Building2, Target, TrendingUp, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TypewriterEffect } from "@/components/ui/typewriter-effect"

const TYPEWRITER_WORDS = [
  "ATS skorları ile en uygun adayları öne çıkarın.",
  "Doğru adayı dakikalar içinde bulun.",
  "İşe alım sürenizi %90'a kadar kısaltın.",
  "CV analizi ile kaliteyi artırın.",
  "Tek panelden tüm süreci yönetin.",
]

export function IsverenHero() {
  return (
    <section className="container mx-auto px-4 pb-16 pt-24 md:pb-24 md:pt-32">
      <div className="mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-100/70 px-4 py-2 text-sm font-medium text-accent-800 dark:bg-accent-500/10 dark:text-accent-200"
        >
          <Building2 className="size-4" />
          <span>İşverenler için akıllı işe alım</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 text-balance text-5xl font-bold leading-tight md:text-7xl"
        >
          <span className="gradient-text">En iyi geliştiricileri</span>
          <br />
          ekibinize katın
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mb-6 flex min-h-12 max-w-3xl items-center justify-center text-xl text-muted-foreground md:text-2xl"
        >
          <TypewriterEffect
            words={TYPEWRITER_WORDS}
            className="font-medium text-primary"
            typingSpeed={70}
            deletingSpeed={40}
            delayBetweenWords={2500}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground"
        >
          CV analizi, ATS skoru ve semantik eşleştirme ile ilanlarınıza en iyi uyan geliştiricileri dakikalar içinde görün.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button asChild size="lg" className="h-12 min-w-[14rem] rounded-full bg-gradient-to-r from-accent-500 to-accent-400 text-white hover:from-accent-600 hover:to-accent-500">
            <Link href="/isveren#sirket-talebi" className="flex items-center gap-2">
              Şirket Talebi Oluştur
              <ArrowRight className="size-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="h-12 min-w-56 rounded-full border-accent-500/30 bg-background/70">
            <Link href="#ozellikler">Nasıl Çalışır?</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-10 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-6"
        >
          {[
            { value: "%90", label: "Daha Hızlı İşe Alım", icon: Zap },
            { value: "%98", label: "Eşleşme Doğruluğu", icon: Target },
            { value: "1000+", label: "Aktif Aday", icon: TrendingUp },
          ].map((stat, idx) => (
            <Card key={idx} className="border border-accent-500/20 bg-white/75 backdrop-blur-xl dark:bg-zinc-900/60">
              <CardContent className="p-5 text-center">
                <stat.icon className="mx-auto mb-2 size-8 text-primary" />
                <div className="gradient-text mb-1 text-3xl font-bold md:text-4xl">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
