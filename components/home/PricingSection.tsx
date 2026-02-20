"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Info } from "lucide-react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { getPlanPrice } from "@/lib/billing/plans"
import type { BillingPeriod } from "@/lib/payments/types"
import type { CompanyPlan } from "@/lib/types"

interface PlanFeature {
    text: string
    tooltip?: string
}

interface PricingPlan {
    name: string
    slug: "free" | "orta" | "premium"
    description: string
    features: PlanFeature[]
    popular?: boolean
    cta: string
    ctaLink: string
}

const plans: PricingPlan[] = [
    {
        name: "Basic",
        slug: "free",
        description: "Bireyler ve küçük projeler için ideal",
        features: [
            { text: "En fazla 5 ilan", tooltip: "Aktif iş ilanı hakkı" },
            { text: "Temel destek", tooltip: "Destek talebi ve yanıt" },
            { text: "E-posta destek", tooltip: "Destek talebi için e-posta kanalı" },
            { text: "Temel analitik", tooltip: "Başvuru ve eşleşme istatistikleri" },
        ],
        cta: "Ücretsiz Başla",
        ctaLink: "/auth/kayit?plan=free",
    },
    {
        name: "Pro",
        slug: "orta",
        description: "Büyüyen takımlar ve işletmeler için ideal",
        popular: true,
        features: [
            { text: "100 ilan hakkı", tooltip: "Aylık aktif ilan limiti" },
            { text: "Destek ve canlı destek", tooltip: "E-posta ve canlı destek erişimi" },
            { text: "Öncelikli destek", tooltip: "Daha hızlı yanıt süresi" },
            { text: "Gelişmiş analitik", tooltip: "Detaylı raporlar ve grafikler" },
            { text: "10 İK çalışanına kadar", tooltip: "Şirketinize ekleyebileceğiniz İK sayısı" },
        ],
        cta: "Planı Satın Al",
        ctaLink: "/auth/kayit?plan=orta",
    },
    {
        name: "Enterprise",
        slug: "premium",
        description: "Büyük kurumlar ve ileri düzey ihtiyaçlar için",
        features: [
            { text: "Sınırsız ilan hakkı", tooltip: "Aktif ilan limiti yok" },
            { text: "Sınırsız İK çalışanı", tooltip: "Şirketinize ekleyebileceğiniz İK sayısı sınırsız" },
            { text: "7/24 destek", tooltip: "Kesintisiz premium destek" },
            { text: "Özel hesap yöneticisi", tooltip: "Size özel teknik ve iş geliştirme desteği" },
            { text: "API erişimi", tooltip: "Entegrasyon ve otomasyon için API" },
            { text: "White-label / özelleştirme", tooltip: "Kendi markanızla kullanım seçenekleri" },
        ],
        cta: "Planı Satın Al",
        ctaLink: "/auth/kayit?plan=premium",
    },
]

function PricingCard({
    plan,
    billingPeriod,
    delay,
    isCurrentPlan,
    ctaLink,
}: {
    plan: PricingPlan
    billingPeriod: BillingPeriod
    delay: number
    isCurrentPlan?: boolean
    ctaLink: string
}) {
    const price =
        plan.slug === "free"
            ? 0
            : billingPeriod === "monthly"
              ? getPlanPrice(plan.slug, "monthly")
              : Math.round(getPlanPrice(plan.slug, "annually") / 12)
    const isHighlighted = plan.popular || isCurrentPlan
    const showPopularBadge = plan.popular
    const showCurrentPlanBadge = isCurrentPlan && !plan.popular
    const isLoggedIn = useAuth()


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="h-full"
        >
            <Card
                className={cn(
                    "relative h-full flex flex-col transition-all duration-300",
                    "bg-white/75 dark:bg-zinc-900/60 hover:shadow-xl hover:shadow-accent-500/10",
                    showCurrentPlanBadge
                        ? "border border-border"
                        : "border border-accent-500/20",
                    showPopularBadge && !showCurrentPlanBadge && "border-2 border-accent-500 shadow-lg shadow-accent-500/20"
                )}
            >
                {showPopularBadge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="from-accent-500 to-accent-400 text-white hover:from-accent-600 hover:to-accent-500 px-3 py-1 text-xs font-medium rounded-full">
                            En Popüler
                        </Badge>
                    </div>
                )}          
                {showCurrentPlanBadge && (
                    <Badge variant= 'secondary'             
                        className="absolute right-3 top-3 origin-top-right"
                        aria-hidden
                    >
                        Mevcut plan
                    </Badge>
                )}

                <CardContent className="p-8 grow flex flex-col">
                    {/* Header */}
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                            {price === 0 ? (
                                <span className="text-5xl font-bold text-foreground">Ücretsiz</span>
                            ) : (
                                <>
                                    <span className="text-5xl font-bold text-foreground">
                                        {price.toLocaleString("tr-TR")} ₺
                                    </span>
                                    <span className="text-muted-foreground">/ay</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                        asChild
                        className={cn(
                            "w-full mb-8 transition-colors",
                            isHighlighted
                                ? "from-accent-500 to-accent-400 text-white border-2 border-accent-500 hover:from-accent-600 hover:to-accent-500 hover:border-accent-600"
                                : "bg-accent-100/70 dark:bg-zinc-800 text-foreground border-2 border-accent-500/25 hover:bg-accent-200/70 dark:hover:bg-zinc-700 hover:border-accent-500/55"
                        )}
                    >
                        <Link href={isLoggedIn ? ctaLink : "/auth/kayit"}>{showCurrentPlanBadge ? "Planımı Değiştir" : plan.cta}</Link>
                    </Button>

                    {/* Features */}
                    <div className="grow">
                        <p className="text-sm font-medium text-foreground mb-4">
                            {plan.name === "Basic" ? "Neler dahil:" : plan.name === "Pro" ? "Basic'teki her şey, artı:" : "Pro'daki her şey, artı:"}
                        </p>
                        <TooltipProvider>
                            <ul className="space-y-3">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <Check className="size-4 text-accent-500 dark:text-accent-300 shrink-0" />
                                            <span className="text-sm text-foreground">{feature.text}</span>
                                        </div>
                                        {feature.tooltip && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Info className="size-4 text-muted-foreground/50 hover:text-muted-foreground cursor-help shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-sm max-w-[200px]">{feature.tooltip}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </TooltipProvider>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

const companyRoles = ["company", "company_admin", "hr"] as const

export function PricingSection({
    ctaPathPrefix,
    ctaHashAnchor,
}: {
    /** When set, CTA links become {ctaPathPrefix}?plan={slug}{#ctaHashAnchor}. E.g. "/isveren" for employer page. */
    ctaPathPrefix?: string
    /** Optional hash anchor for CTA links, e.g. "sirket-talebi". */
    ctaHashAnchor?: string
} = {}) {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annually")
    const [currentPlanSlug, setCurrentPlanSlug] = useState<CompanyPlan | null>(null)
    const { role } = useAuth()
    const isCompanyOrEmployee = !!role && companyRoles.includes(role as (typeof companyRoles)[number])

    useEffect(() => {
        if (!isCompanyOrEmployee) {
            setCurrentPlanSlug(null)
            return
        }
        fetch("/api/me/company-plan")
            .then((res) => res.json())
            .then((data: { plan?: CompanyPlan | null }) => setCurrentPlanSlug(data?.plan ?? null))
            .catch(() => setCurrentPlanSlug(null))
    }, [isCompanyOrEmployee])

    const getCtaLink = (plan: PricingPlan) => {
        const query = `plan=${plan.slug}&billing=${billingPeriod}`
        if (ctaPathPrefix) {
            const base = `${ctaPathPrefix}?${query}`
            return ctaHashAnchor ? `${base}#${ctaHashAnchor}` : base
        }
        const basePath = "/auth/kayit"
        const full = `${basePath}?${query}`
        return ctaHashAnchor ? `${full}#${ctaHashAnchor}` : full
    }

    return (
        <section id="ucretlendirme" className="container mx-auto px-4 py-20 md:py-32">
            <div className="text-center mb-12">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-bold mb-6 text-foreground"
                >
                    Size uygun <span className="from-accent-500 to-accent-400 bg-clip-text text-transparent">planı seçin</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
                >
                    İhtiyacınıza göre en uygun planı seçin ve hemen başlayın
                </motion.p>

                {/* Billing Toggle */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-1 p-1 rounded-full border border-accent-500/25 bg-accent-100/60 dark:bg-zinc-900/70"
                >
                    <button
                        onClick={() => setBillingPeriod("monthly")}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-transparent",
                            billingPeriod === "monthly"
                                ? "bg-white text-foreground shadow-sm border-accent-500/30 dark:bg-zinc-800 dark:text-white dark:border-accent-400/30"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Aylık
                    </button>
                    <button
                        onClick={() => setBillingPeriod("annually")}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 border border-transparent",
                            billingPeriod === "annually"
                                ? "bg-white text-foreground shadow-sm border-accent-500/30 dark:bg-zinc-800 dark:text-white dark:border-accent-400/30"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Yıllık
                        <Badge variant="secondary" className="bg-accent-500/15 text-accent-700 dark:text-accent-200 text-xs px-2 py-0.5">
                            %20 Tasarruf
                        </Badge>
                    </button>
                </motion.div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {plans.map((plan, idx) => (
                    <PricingCard
                        key={plan.name}
                        plan={plan}
                        billingPeriod={billingPeriod}
                        delay={idx * 0.1}
                        isCurrentPlan={currentPlanSlug != null && plan.slug === currentPlanSlug ? true : undefined}
                        ctaLink={getCtaLink(plan)}
                    />
                ))}
            </div>
        </section>
    )
}
