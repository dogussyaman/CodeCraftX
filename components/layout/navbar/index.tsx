"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";
import { springTransition } from "./constants";
import { DesktopNav } from "./desktop-nav";
import { DesktopActions } from "./desktop-actions";
import { MobileMenuToggle } from "./mobile-menu-toggle";
import { MobileMenuPanel } from "./mobile-menu-panel";

export function ModernNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, loading, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
    } else {
      const scrollY = document.body.style.top ? parseInt(document.body.style.top, 10) * -1 : 0;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      if (scrollY) window.scrollTo(0, scrollY);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const getDashboardLink = () => {
    if (role === "admin" || role === "platform_admin" || role === "mt") return "/dashboard/admin";
    if (role === "hr") return "/dashboard/ik";
    if (role === "company_admin") return "/dashboard/company";
    return "/dashboard/gelistirici";
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={springTransition}
      className={`fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)] transition-[background-color,border-color,box-shadow] duration-300 ease-out ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] md:grid-cols-3 items-center h-14 sm:h-16 gap-2 min-w-0 min-h-[44px] sm:min-h-0">
          <div className="flex items-center justify-start min-w-0 overflow-hidden">
            <Logo className="min-w-0" />
          </div>

          <nav
            className="hidden md:flex items-center justify-center min-w-0"
            aria-label="Ana menü"
          >
            <DesktopNav isActive={isActive} />
          </nav>

          <div className="flex items-center justify-end gap-1 sm:gap-2 min-w-0 overflow-hidden">
            <DesktopActions
              loading={loading}
              user={user}
              getDashboardLink={getDashboardLink}
              onLogout={handleLogout}
            />
            <MobileMenuToggle isOpen={isMobileMenuOpen} onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
          </div>
        </div>
      </div>

      <MobileMenuPanel
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isActive={isActive}
        loading={loading}
        user={user}
        getDashboardLink={getDashboardLink}
        onLogout={handleLogout}
      />
    </motion.header>
  );
}
