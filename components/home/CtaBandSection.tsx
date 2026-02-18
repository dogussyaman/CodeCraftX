"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaBandSection() {
  return (
    <section className="relative w-full py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl"
        >
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Hemen başlayın
          </h2>
          <p className="mt-3 text-muted-foreground">
            Hesap oluşturun, ilan verin veya aday olun. Tek platformda yetenek ve fırsatı buluşturun.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 rounded-full bg-accent-500 px-6 text-white hover:bg-accent-600"
          >
            <Link href="/auth/kayit" className="inline-flex items-center gap-2">
              Ücretsiz Kayıt
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
