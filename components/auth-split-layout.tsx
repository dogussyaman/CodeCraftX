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
      {/* Left Side - Gradient Background */}
      <div className="relative hidden lg:flex overflow-hidden bg-gradient-to-br from-primary via-accent to-primary/80">

        {/* Blob Effects - Token-based */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/40 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-blob" />
        <div className="absolute -top-10 -right-20 w-56 h-56 bg-accent/40 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-warning/30 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-blob animation-delay-4000" />
        <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-primary/30 rounded-full mix-blend-multiply blur-3xl opacity-40 animate-blob animation-delay-2000" />

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
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
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
