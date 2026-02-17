"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { NAV_ITEMS, springTransition, springFast } from "./constants";

const btnClass =
  "navbar-btn w-full justify-center gap-2 h-11 min-h-[44px] rounded-lg transition-[border-color,background-color,color] duration-200";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isActive: (href: string) => boolean;
  loading: boolean;
  user: unknown;
  getDashboardLink: () => string;
  onLogout: () => void;
  isLoggingOut?: boolean;
};

export function MobileMenuPanel({
  isOpen,
  onClose,
  isActive,
  loading,
  user,
  getDashboardLink,
  onLogout,
  isLoggingOut = false,
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          aria-hidden
          onClick={onClose}
        />
      )}
      {isOpen && (
        <motion.div
          key="mobile-panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={springTransition}
          className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[min(320px,85vw)] md:hidden border-l border-border/50 bg-background/95 backdrop-blur-xl shadow-xl flex flex-col overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)]"
          role="dialog"
          aria-label="Mobil menü"
        >
          <div className="flex items-center justify-between h-14 sm:h-16 px-4 border-b border-border/50 shrink-0">
            <Logo />
            <button
              type="button"
              onClick={onClose}
              className="p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Menüyü kapat"
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1" aria-label="Mobil menü">
            {NAV_ITEMS.map((item, index) => {
              const active = isActive(item.href);
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ ...springFast, delay: index * 0.03 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center min-h-[44px] px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-accent-100/70 dark:bg-accent-500/20 text-accent-800 dark:text-accent-200"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent-100/60 dark:hover:bg-accent-500/20 dark:hover:text-accent-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              );
            })}
            <div className="pt-4 mt-4 space-y-2 border-t border-border/50">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-11 w-full rounded-lg bg-muted/60 animate-pulse" />
                  <div className="h-11 w-full rounded-lg bg-muted/60 animate-pulse" />
                </div>
              ) : (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springFast, delay: NAV_ITEMS.length * 0.03 }}
                >
                  {user ? (
                    <>
                      <Button variant="outline" asChild className={`${btnClass} border-accent-500/30 hover:bg-accent-100/60 hover:text-accent-700 dark:hover:bg-accent-500/20 dark:hover:text-accent-200`} onClick={onClose}>
                        <Link href={getDashboardLink()}>
                          <LayoutDashboard className="size-4" />
                          Panelim
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => { onLogout(); onClose(); }}
                        disabled={isLoggingOut}
                        className={`${btnClass} text-destructive hover:bg-destructive/10 hover:border-destructive/50`}
                      >
                        <LogOut className="size-4" />
                        {isLoggingOut ? "Çıkılıyor…" : "Çıkış Yap"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      asChild
                      className={`${btnClass} h-11 border-accent-500/30 hover:bg-accent-100/60 hover:text-accent-700 dark:hover:bg-accent-500/20 dark:hover:text-accent-200`}
                      onClick={onClose}
                    >
                      <Link href="/auth/giris">Giriş Yap</Link>
                    </Button>
                  )}
                </motion.div>
              )}
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
