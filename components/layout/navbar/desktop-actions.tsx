"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const btnClass =
  "navbar-btn text-[15px] font-medium rounded-lg gap-2 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]";

type Props = {
  loading: boolean;
  user: unknown;
  getDashboardLink: () => string;
  onLogout: () => void;
};

export function DesktopActions({ loading, user, getDashboardLink, onLogout }: Props) {
  return (
    <div className="hidden md:flex items-center gap-2 shrink-0">
      <ThemeToggle />
      <div className="h-5 w-px bg-border/50" />
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 rounded-md bg-muted/60 animate-pulse" />
          <div className="h-9 w-20 rounded-md bg-muted/60 animate-pulse" />
        </div>
      ) : user ? (
        <>
          <Button variant="outline" size="sm" asChild className={`${btnClass} border-accent-500/30 hover:bg-accent-100/60 hover:text-accent-700 hover:border-accent-500/50 dark:hover:bg-accent-500/20 dark:hover:text-accent-200 dark:border-accent-500/30`}>
            <Link href={getDashboardLink()}>
              <LayoutDashboard className="size-4" />
              Panelim
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className={`${btnClass} border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50`}
          >
            <LogOut className="size-4" />
            Çıkış
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          asChild
          className={`${btnClass} border-accent-500/30 hover:bg-accent-100/60 hover:text-accent-700 hover:border-accent-500/50 dark:hover:bg-accent-500/20 dark:hover:text-accent-200 text-foreground`}
        >
          <Link href="/auth/giris">Giriş Yap</Link>
        </Button>
      )}
    </div>
  );
}
