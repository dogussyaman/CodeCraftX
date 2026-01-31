"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";
import { useAuth } from "@/hooks/use-auth";

export function ModernNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user, role, loading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const getDashboardLink = () => {
    // Rol bilgisi henüz yüklenmemişse default olarak geliştirici paneline yönlendir
    // Dashboard sayfası kendi içinde doğru yönlendirmeyi yapacaktır
    if (role === "admin") return "/dashboard/admin";
    if (role === "hr") return "/dashboard/ik";
    return "/dashboard/gelistirici";
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-[auto_1fr_auto] items-center h-16 gap-4">
          {/* Logo */}
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center gap-6">
            {[
              { href: "/hakkimizda", label: "Hakkımızda" },
              { href: "/projeler", label: "Projeler" },
              { href: "/is-ilanlari", label: "İş İlanları" },
              { href: "/isveren", label: "İşveren" },
              { href: "/iletisim", label: "İletişim" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <div className="h-6 w-px bg-border/50 mx-1" />
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-9 w-24 rounded-md bg-muted/60 animate-pulse" />
                <div className="h-9 w-20 rounded-md bg-muted/60 animate-pulse" />
              </div>
            ) : (
              <>
                {user ? (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="rounded-lg border-border hover:bg-muted/50 hover:text-foreground gap-2 transition-colors"
                    >
                      <Link href={getDashboardLink()}>
                        <LayoutDashboard className="size-4" />
                        Panelim
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="rounded-lg border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 gap-2 transition-colors"
                    >
                      <LogOut className="size-4" />
                      Çıkış
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      asChild
                      className="border-border/60 hover:text-gray-600 dark:hover:text-white hover:border-border hover:bg-muted/50 text-foreground transition-colors"
                    >
                      <Link href="/auth/giris">Giriş Yap</Link>
                    </Button>
                    <Button
                      asChild
                      className="relative overflow-hidden from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-sm hover:shadow transition-all duration-200"
                    >
                      <Link href="/auth/kayit">
                        <span className="relative z-10 font-medium">
                          Başlayın
                        </span>
                      </Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-foreground p-2 hover:bg-muted/50 rounded-lg transition-colors active:bg-muted"
          >
            {isMobileMenuOpen ? (
              <X className="size-6" />
            ) : (
              <Menu className="size-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              {[
                { href: "/hakkimizda", label: "Hakkımızda" },
                { href: "/projeler", label: "Projeler" },
                { href: "/is-ilanlari", label: "İş İlanları" },
                { href: "/isveren", label: "İşveren" },
                { href: "/iletisim", label: "İletişim" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 space-y-4 border-t border-border/50">
                <div className="flex items-center justify-between px-2">
                  <ThemeToggle />
                </div>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-11 w-full rounded-md bg-muted/60 animate-pulse" />
                    <div className="h-11 w-full rounded-md bg-muted/60 animate-pulse" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {user ? (
                      <>
                        <Button
                          variant="outline"
                          asChild
                          className="w-full justify-start gap-2 h-11 rounded-lg border-border hover:bg-muted/50 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Link href={getDashboardLink()}>
                            <LayoutDashboard className="size-4" />
                            Panelim
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="w-full justify-start gap-2 h-11 rounded-lg border-border text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-colors"
                        >
                          <LogOut className="size-4" />
                          Çıkış Yap
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          asChild
                          className="w-full h-11 border-border/60 hover:border-border hover:bg-muted/50 text-foreground transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Link href="/auth/giris">Giriş Yap</Link>
                        </Button>
                        <Button
                          asChild
                          className="w-full h-11 from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-sm hover:shadow transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Link href="/auth/kayit">Başlayın</Link>
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
