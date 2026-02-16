"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, Code2, Cpu, Shield, Terminal, Database, Braces, GitBranch } from "lucide-react"
import { motion } from "motion/react"
import { Logo } from "./logo"

interface AuthSplitLayoutProps {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthSplitLayout({ children, title, subtitle }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      {/* Left Side - Dark gradient (blog-style) + dot grid + decorative elements */}
      <div className="relative hidden lg:flex overflow-hidden bg-gradient-to-br from-[#0f2d3a] via-[#134050] to-[#0f2d3a]">
        {/* Accent tema tint – theme-accent ile uyumlu, arkada kalır */}
        <div className="absolute inset-0 z-0 bg-accent-500/10 pointer-events-none" aria-hidden />

        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.12] text-white"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute -right-1/4 -top-1/4 h-[80%] w-[80%] rounded-full bg-blue-400/12 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 right-0 h-1/2 w-1/2 rounded-full bg-blue-300/8 blur-2xl" aria-hidden />

        {/* Right: network/code graph (BlogHero-style) */}
        <div className="absolute -right-[12%] top-1/2 h-[85%] w-[55%] min-w-[280px] max-w-[420px] -translate-y-1/2 opacity-90 md:-right-[8%] md:w-[48%]" aria-hidden>
          <svg viewBox="0 0 280 220" className="h-full w-full object-contain object-right" fill="none">
            <defs>
              <linearGradient id="auth-hero-line-a" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a5f3fc" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#a5f3fc" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="auth-hero-line-b" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="auth-hero-line-c" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path d="M 20 60 Q 90 20 160 70 T 280 50" fill="none" stroke="url(#auth-hero-line-a)" strokeWidth="2" strokeLinecap="round" />
            <path d="M 0 120 Q 80 80 150 130 T 260 110" fill="none" stroke="url(#auth-hero-line-b)" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 30 180 Q 120 140 200 190" fill="none" stroke="url(#auth-hero-line-c)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 100 40 L 180 100 M 180 100 L 240 60" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeLinecap="round" />
            <circle cx="20" cy="60" r="5" fill="#e0f2fe" />
            <circle cx="160" cy="70" r="6" fill="#a5f3fc" />
            <circle cx="280" cy="50" r="4" fill="#67e8f9" />
            <circle cx="150" cy="130" r="5" fill="#e0f2fe" />
            <circle cx="260" cy="110" r="4" fill="#a5f3fc" />
            <circle cx="200" cy="190" r="5" fill="#67e8f9" />
            <circle cx="100" cy="40" r="4" fill="rgba(255,255,255,0.6)" />
            <circle cx="240" cy="60" r="3" fill="rgba(255,255,255,0.5)" />
          </svg>
        </div>

        {/* Left top: code brackets */}
        <div className="absolute -left-6 top-4 h-32 w-32 text-white/20 md:-left-4 md:h-40 md:w-40" aria-hidden>
          <svg viewBox="0 0 80 80" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M 60 10 L 30 40 L 60 70" />
            <path d="M 20 10 L 50 40 L 20 70" />
          </svg>
        </div>
        {/* Left bottom: angle bracket */}
        <div className="absolute -left-2 bottom-6 h-24 w-24 text-white/15 md:h-28 md:w-28" aria-hidden>
          <svg viewBox="0 0 60 60" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M 15 15 L 45 30 L 15 45" />
          </svg>
        </div>
        {/* Right top: node + line */}
        <div className="absolute right-[28%] top-2 h-20 w-20 text-white/25 md:right-[24%] md:h-24 md:w-24" aria-hidden>
          <svg viewBox="0 0 60 60" className="h-full w-full" fill="currentColor">
            <circle cx="50" cy="15" r="8" />
            <circle cx="10" cy="45" r="5" opacity="0.7" />
            <path d="M 50 15 Q 30 30 10 45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </svg>
        </div>

        {/* Floating Icons - Positioned at corners */}
        {/* Top Left */}
        <motion.div
          className="absolute top-8 left-8 text-white/20"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        >
          <Code2 size={40} />
        </motion.div>

        {/* Top Right */}
        <motion.div
          className="absolute top-12 right-10 text-white/15"
          animate={{ y: [0, 20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        >
          <Terminal size={36} />
        </motion.div>

        {/* Bottom Left */}
        <motion.div
          className="absolute bottom-20 left-10 text-white/20"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 9, repeat: Infinity }}
        >
          <Database size={34} />
        </motion.div>

        {/* Bottom Right */}
        <motion.div
          className="absolute bottom-12 right-8 text-white/15"
          animate={{ y: [0, 25, 0] }}
          transition={{ duration: 11, repeat: Infinity }}
        >
          <Cpu size={38} />
        </motion.div>

        {/* Mid corners */}
        <motion.div
          className="absolute top-1/4 left-6 text-white/10"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        >
          <Braces size={32} />
        </motion.div>

        <motion.div
          className="absolute top-1/4 right-6 text-white/15"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
        >
          <Shield size={30} />
        </motion.div>

        <motion.div
          className="absolute bottom-1/3 left-6 text-white/10"
          animate={{ y: [0, 15, 0], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        >
          <GitBranch size={28} />
        </motion.div>

        {/* Text Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-5xl font-bold mb-6 text-balance">
            CodeCraftX'e Hoş Geldiniz
          </h1>

          <p className="text-xl text-white/90 max-w-md leading-relaxed">
            Yetenek ve fırsatları buluşturan platform. CV'nizi yükleyin,
            becerilerinizi sergileyin, hayalinizdeki işe kavuşun.
          </p>

          <div className="mt-12 space-y-4">
            {[
              "Akıllı CV Analizi",
              "Beceri Eşleştirme Algoritması",
              "Binlerce İş Fırsatı",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  ✓
                </div>
                <span className="text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Logo className="mb-8" />
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent-600 dark:hover:text-accent-400 transition-colors mb-6"
            >
              <ArrowLeft className="size-4" />
              Ana Sayfaya Dön
            </Link>

            <h2 className="text-3xl font-bold tracking-tight mb-2">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
