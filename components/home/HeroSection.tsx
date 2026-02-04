"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TypewriterEffect } from "@/components/ui/typewriter-effect"
import { ArrowRight, Zap, Sparkles, Target, TrendingUp } from "lucide-react"
import { motion } from "motion/react"

const TYPEWRITER_WORDS = [
  "Yeni nesil HR platformu.",
  "CV analizi ile akıllı eşleştirme.",
  "Doğru yetenek, doğru fırsat.",
  "Geliştiricileri işlerle buluşturuyoruz.",
]

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm"
        >
          <Sparkles className="size-4" />
          <span>Yapay Zeka Destekli Eşleştirme Sistemi</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-5xl font-bold leading-tight text-balance md:text-7xl"
        >
          <span className="gradient-text">Yetenek</span> ve <span className="gradient-text">Fırsatları</span>
          <br />
          Akıllıca Buluşturun
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 flex min-h-12 items-center justify-center text-xl text-muted-foreground md:text-2xl"
        >
          <TypewriterEffect
            words={TYPEWRITER_WORDS}
            className="text-primary font-medium"
            typingSpeed={70}
            deletingSpeed={40}
            delayBetweenWords={2500}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty"
        >
          İş ilanlarını akıllı eşleştirme, hızlı başvuru yönetimi ve şeffaf raporlama ile tek panelden yönetin.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col justify-center gap-4 sm:flex-row"
        >
          <Button size="lg" asChild className="text-base font-semibold relative overflow-hidden group glow-effect">
            <Link href="/auth/kayit">
              <span className="relative z-10 flex items-center gap-2">
                Ücretsiz Başlayın
                <ArrowRight className="size-5" />
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-primary via-secondary to-accent opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="text-base font-semibold border-border hover:border-primary/50 bg-background/50 backdrop-blur-sm hover:bg-card/50 transition-all duration-300"
          >
            <Link href="#ozellikler">Özellikleri Keşfet</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 grid max-w-4xl grid-cols-1 gap-6 md:mt-16 md:grid-cols-3"
        >
          {[
            { value: "%98", label: "Eşleşme Doğruluğu", icon: Target },
            { value: "5dk", label: "Ortalama İşlem Süresi", icon: Zap },
            { value: "1000+", label: "Başarılı Eşleşme", icon: TrendingUp },
          ].map((stat, idx) => (
            <Card
              key={idx}
              className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10"
            >
              <CardContent className="p-6 text-center">
                <stat.icon className="size-8 text-primary mx-auto mb-3" />
                <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
