"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Code2, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./logo";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function ModernNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"developer" | "hr" | "admin" | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      setRole(profile?.role || "developer");
    } catch (error) {
      console.error("Profile fetch error:", error);
      setRole("developer");
    }
  }, [supabase]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!isMounted) return;
        
        setUser(currentUser);
        // Kullanıcı bilgisi geldiğinde loading'i false yap, butonları göster
        setLoading(false);

        // Rol bilgisini arka planda yükle (non-blocking)
        if (currentUser) {
          fetchUserRole(currentUser.id).catch((error) => {
            console.error("Role fetch error:", error);
          });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      const currentUser = session?.user || null;
      setUser(currentUser);
      // Kullanıcı bilgisi geldiğinde loading'i false yap
      setLoading(false);

      // Rol bilgisini arka planda yükle (non-blocking)
      if (currentUser) {
        fetchUserRole(currentUser.id).catch((error) => {
          console.error("Role fetch error:", error);
        });
      } else {
        setRole(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserRole, pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
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
            {!loading && (
              <>
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      asChild
                      className="hover:bg-muted/50 hover:text-foreground gap-2 transition-colors"
                    >
                      <Link href={getDashboardLink()}>
                        <LayoutDashboard className="size-4" />
                        Panelim
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="hover:bg-destructive/10 hover:text-destructive gap-2 transition-colors"
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
                {!loading && (
                  <div className="space-y-2">
                    {user ? (
                      <>
                        <Button
                          variant="ghost"
                          asChild
                          className="w-full justify-start gap-2 h-11 hover:bg-muted/50 transition-colors"
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
                          className="w-full justify-start gap-2 h-11 text-destructive hover:bg-destructive/10 transition-colors"
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
