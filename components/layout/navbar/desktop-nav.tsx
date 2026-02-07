"use client";

import Link from "next/link";
import { useState, useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import { NAV_ITEMS, springPill, springFast } from "./constants";

const MotionLink = motion(Link);

export function DesktopNav({
  isActive,
}: {
  isActive: (href: string) => boolean;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  const highlightIndex =
    hoveredIndex ?? NAV_ITEMS.findIndex((item) => isActive(item.href));
  const showPill = highlightIndex >= 0;

  useLayoutEffect(() => {
    if (!showPill || highlightIndex < 0 || highlightIndex >= itemRefs.current.length) return;
    const el = itemRefs.current[highlightIndex];
    const list = el?.closest("ul");
    if (!el || !list) return;
    const listRect = list.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setPill({
      left: elRect.left - listRect.left,
      width: elRect.width,
    });
  }, [highlightIndex, showPill]);

  return (
    <ul
      className="relative flex w-fit list-none rounded-full border border-border/70 px-2 py-1.5 flex-nowrap"
      role="list"
    >
      {showPill && (
        <motion.li
          className="pointer-events-none absolute inset-y-0 my-1.5 rounded-full bg-gray-300 shadow-sm dark:bg-white/40 dark:shadow-primary/10"
          aria-hidden
          initial={false}
          animate={{ left: pill.left, width: pill.width }}
          transition={springPill}
          style={{ willChange: "left, width" }}
        />
      )}
      {NAV_ITEMS.map((item, idx) => {
        const isHighlight = highlightIndex === idx;
        return (
          <li
            key={item.href}
            ref={(el) => { itemRefs.current[idx] = el; }}
            className="relative z-10 block"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <MotionLink
              href={item.href}
              className={`
                block cursor-pointer px-4 py-1.5 text-[15px] font-medium tracking-tight whitespace-nowrap
                transition-colors duration-300 ease-out
                focus-visible:text-primary focus-visible:outline-none
                ${isHighlight
                  ? "text-foreground dark:text-white"
                  : "text-muted-foreground hover:text-primary"
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={springFast}
            >
              {item.label}
            </MotionLink>
          </li>
        );
      })}
    </ul>
  );
}
