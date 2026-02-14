"use client";

import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { springFast } from "./constants";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
};

export function MobileMenuToggle({ isOpen, onToggle }: Props) {
  return (
    <div className="flex md:hidden items-center gap-0.5 shrink-0">
      <div className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-1 touch-manipulation" aria-hidden>
        <ThemeToggle />
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="text-foreground p-3 -mr-1 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-muted/50 rounded-lg transition-colors active:bg-muted touch-manipulation"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={springFast}
            >
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={springFast}
            >
              <Menu className="size-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
