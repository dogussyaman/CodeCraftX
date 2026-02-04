"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TypewriterEffect } from "@/components/ui/typewriter-effect"
import {
  ArrowRight,
  Zap,
  Building2,
  Target,
  TrendingUp,
} from "lucide-react"
import { motion } from "motion/react"

const TYPEWRITER_WORDS = [
  "Doğru yetenekleri bulun.",
  "İşe alım süresini kısaltın.",
  "Yapay zeka ile eşleştirin.",
  "Kaliteli adaylara ulaşın.",
]

export function IsverenHero() {
  return (
    <section className="container mx-auto px-4 pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm"
        >
          <Building2 className="size-4" />
          <span>İşverenler İçin Akıllı İşe Alım Platformu</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-5xl md:text-7xl font-bold text-balance leading-tight"
        >
          <span className="gradient-text">En İyi Geliştiricileri</span>
          <br />
          Ekibinize Katın
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
          className="mt-4 text-lg text-muted-foreground text-pretty max-w-2xl mx-auto"
        >
          CV analizi, beceri eşleştirme ve otomatik aday taraması ile ihtiyacınız olan yazılımcıya hızlıca ulaşın.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" asChild className="text-base font-semibold relative overflow-hidden group glow-effect">
            <Link href="/isveren#sirket-talebi">
              <span className="relative z-10 flex items-center gap-2">
                Şirket Talebi Oluştur
                <ArrowRight className="size-5" />
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-primary via-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="text-base font-semibold border-border/50 hover:border-primary/50 bg-background/50 backdrop-blur-sm"
          >
            <Link href="#ozellikler">Nasıl Çalışır?</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {[
            { value: "%90", label: "Daha Hızlı İşe Alım", icon: Zap },
            { value: "%98", label: "Eşleşme Doğruluğu", icon: Target },
            { value: "1000+", label: "Aktif Aday", icon: TrendingUp },
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
