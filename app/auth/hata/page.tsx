"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function AuthErrorPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden bg-background p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-destructive/20 via-transparent to-destructive/10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl p-8"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-6 text-center">
            <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="size-10 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Bir Hata Oluştu</h1>
              <p className="text-muted-foreground">Kimlik doğrulama sırasında bir sorun yaşandı</p>
            </div>

            <p className="text-sm text-muted-foreground">Lütfen tekrar deneyin veya destek ekibiyle iletişime geçin.</p>

            <div className="flex flex-col gap-3">
              <Button
                asChild
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                <Link href="/auth/giris">Tekrar Dene</Link>
              </Button>
              <Button asChild variant="outline" className="w-full h-12 rounded-xl bg-transparent border-border/50">
                <Link href="/">Ana Sayfaya Dön</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
