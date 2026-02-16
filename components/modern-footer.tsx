"use client"

import type React from "react"
import Link from "next/link"
import { MapPin, Mail, Twitter, Instagram, Linkedin, Send, Heart } from "lucide-react"
import { useState } from "react"

import { CONTACT } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "./logo"

export function ModernFooter() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? "Kayıt başarısız.")
        return
      }

      setSubscribed(true)
      setEmail("")
      setTimeout(() => setSubscribed(false), 3000)
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="border-t border-accent-500/20 bg-background/95 backdrop-blur-sm transition-colors duration-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="space-y-4">
            <Logo className="mb-4" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              En son güncellemeler, özel teklifler ve topluluk haberleri için bültenimize katılın.
            </p>
            <form onSubmit={handleSubscribe} className="relative">
              <Input
                type="email"
                placeholder="E-posta adresinizi girin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-accent-500/20 bg-accent-100/60 pr-12 focus:border-accent-500 dark:bg-zinc-900/60"
                required
              />
              <Button
                type="submit"
                size="icon"
                disabled={loading}
                className="absolute right-1 top-1 h-8 w-8 bg-gradient-to-r from-accent-500 to-accent-400 text-white hover:from-accent-600 hover:to-accent-500"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {subscribed && <p className="animate-in fade-in text-sm text-success">Başarıyla kaydoldunuz.</p>}
            {error && <p className="animate-in fade-in text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Hızlı Bağlantılar</h3>
            <ul className="space-y-2.5">
              {[
                { label: "Hakkımızda", href: "/hakkimizda" },
                { label: "İş İlanları", href: "/is-ilanlari" },
                { label: "İşveren", href: "/isveren" },
                { label: "Topluluk", href: "/topluluk" },
                { label: "Yorumlar", href: "/yorumlar" },
                { label: "Haberler", href: "/haberler" },
                { label: "Etkinlikler", href: "/etkinlikler" },
                { label: "Destek", href: "/destek" },
                { label: "İletişim", href: "/iletisim" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-accent-600 dark:hover:text-accent-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">İletişim</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Adres</p>
                  <p className="text-muted-foreground">{CONTACT.address}</p>
                </div>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">E-posta</p>
                  <p className="text-muted-foreground">{CONTACT.email}</p>
                  <p className="text-muted-foreground">{CONTACT.supportEmail}</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Bizi Takip Edin</h3>
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: "https://twitter.com/codecrafters", label: "Twitter" },
                { icon: Instagram, href: "https://instagram.com/codecrafters", label: "Instagram" },
                { icon: Linkedin, href: "https://linkedin.com/company/codecrafters", label: "LinkedIn" },
              ].map((social, index) => (
                <a
                  key={`${social.label}-${index}`}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100/60 text-muted-foreground transition-all hover:bg-accent-200/80 hover:text-accent-600 dark:bg-zinc-900/60 dark:hover:bg-accent-500/15 dark:hover:text-accent-300"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <div className="pt-4">
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-accent-500/20 pt-8 md:flex-row">
          <p className="flex items-center gap-1 text-center text-sm text-muted-foreground md:text-left">
            © 2026 CodeCraftX. Tüm hakları saklıdır.
            <Heart className="inline h-4 w-4 shrink-0 fill-destructive text-destructive" />
            ile Türkiye'de geliştirildi
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:gap-6 sm:text-sm md:justify-end">
            <Link
              href="/gizlilik-politikasi"
              className="text-muted-foreground transition-colors hover:text-accent-600 dark:hover:text-accent-300"
            >
              Gizlilik Politikası
            </Link>
            <Link
              href="/kullanim-sartlari"
              className="text-muted-foreground transition-colors hover:text-accent-600 dark:hover:text-accent-300"
            >
              Kullanım Şartları
            </Link>
            <Link
              href="/cerez-ayarlari"
              className="text-muted-foreground transition-colors hover:text-accent-600 dark:hover:text-accent-300"
            >
              Çerez Ayarları
            </Link>
            <Link href="/kvkk" className="text-muted-foreground transition-colors hover:text-accent-600 dark:hover:text-accent-300">
              KVKK
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
