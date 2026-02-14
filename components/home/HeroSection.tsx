"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TypewriterEffect } from "@/components/ui/typewriter-effect"
import { ButtonHero } from "@/components/moving-border"
import {
    ArrowRight,
    Zap,
    Sparkles,
    Target,
    TrendingUp,
} from "lucide-react"
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 backdrop-blur-sm"
                >
                    <Sparkles className="size-4" />
                    <span>Yapay Zeka Destekli Eşleştirme Sistemi</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight"
                >
                    <span className="gradient-text">Yetenek</span> ve <span className="gradient-text">Fırsatları</span>
                    <br />
                    Akıllıca Buluşturun
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed min-h-12 flex items-center justify-center"
                >
                    <TypewriterEffect
                        words={TYPEWRITER_WORDS}
                        className="text-primary font-medium"
                        typingSpeed={70}
                        deletingSpeed={40}
                        delayBetweenWords={2500}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <ButtonHero
                        as={Link}
                        href="/auth/kayit"
                        containerClassName="h-12 w-auto min-w-[12rem] sm:min-w-[14rem] text-base"
                        borderClassName="!h-28 !w-28 bg-[radial-gradient(circle,black_0%,transparent_70%)] dark:bg-[radial-gradient(circle,white_0%,transparent_70%)] opacity-100"
                        className="border-primary/40 bg-primary text-primary-foreground font-medium dark:text-white dark:bg-slate-900"
                        duration={4000}
                    >
                        <span className="flex items-center gap-2">
                            Ücretsiz Başlayın
                            <ArrowRight className="size-5" />
                        </span>
                    </ButtonHero>
                    <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="text-base rounded-[1.75rem] border-border hover:border-primary/50 bg-background/50 backdrop-blur-sm hover:bg-card/50 transition-all duration-300 h-12 min-w-48 sm:min-w-56 px-6"
                    >
                        <Link href="#ozellikler">Özellikleri Keşfet</Link>
                    </Button>
                </motion.div>

                {/* Floating Cards */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
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
