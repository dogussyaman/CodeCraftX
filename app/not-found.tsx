"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft } from "lucide-react"
import { Logo } from "@/components/logo"

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="max-w-2xl mx-auto space-y-8">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <Logo />
                    </div>

                    {/* 404 Animation */}
                    <div className="relative">
                        <h1 className="text-9xl font-bold text-primary/20 dark:text-primary/10 select-none">
                            404
                        </h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Search className="size-24 text-muted-foreground/30 animate-pulse" />
                        </div>
                    </div>

                    {/* Message */}
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-foreground">
                            Sayfa Bulunamadı
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-md mx-auto">
                            Aradığınız sayfa mevcut değil, taşınmış veya silinmiş olabilir.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                        <Button asChild size="lg" className="gap-2">
                            <Link href="/">
                                <Home className="size-5" />
                                Ana Sayfaya Dön
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="gap-2">
                            <Link href="/is-ilanlari">
                                <Search className="size-5" />
                                İş İlanlarına Göz At
                            </Link>
                        </Button>
                    </div>

                    {/* Helpful Links */}
                    <div className="pt-12 border-t border-border/50">
                        <p className="text-sm text-muted-foreground mb-4">
                            Popüler sayfalar:
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                                href="/hakkimizda"
                                className="text-sm text-primary hover:underline"
                            >
                                Hakkımızda
                            </Link>
                            <Link
                                href="/projeler"
                                className="text-sm text-primary hover:underline"
                            >
                                Projeler
                            </Link>
                            <Link
                                href="/iletisim"
                                className="text-sm text-primary hover:underline"
                            >
                                İletişim
                            </Link>
                            <Link
                                href="/auth/giris"
                                className="text-sm text-primary hover:underline"
                            >
                                Giriş Yap
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
