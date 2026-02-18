"use client";

import Link from "next/link";
import { useState, useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import { NAV_ITEMS, springPill, springFast } from "./constants";

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
      className="relative flex w-fit list-none rounded-full border border-[var(--nav-pill-border)] px-2 py-1.5 flex-nowrap bg-[var(--nav-pill-bg-container)]"
      role="list"
    >
      {showPill && (
        <motion.li
          className="pointer-events-none absolute inset-y-0 my-1.5 rounded-full bg-[var(--nav-pill-bg)] border border-[var(--nav-pill-border)] shadow-[var(--nav-pill-shadow)]"
          aria-hidden
          initial={false}
          animate={{ left: pill.left, width: pill.width }}
          transition={springPill}
          style={{ willChange: "left, width" }}
        />
      )}
      {NAV_ITEMS.map((item, idx) => {
        const isHighlight = highlightIndex === idx;
        const isHovered = hoveredIndex === idx;
        const active = isActive(item.href);
        const textClass = isHovered
          ? "text-[var(--nav-link-hover)]"
          : active
            ? "text-[#2563eb]"
            : "text-[var(--nav-link)]";
        return (
          <li
            key={item.href}
            ref={(el) => { itemRefs.current[idx] = el; }}
            className="relative z-10 block"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Link
              href={item.href}
              className={`
                block w-full px-4 py-1.5 text-[15px] font-medium tracking-tight whitespace-nowrap
                transition-colors duration-300 ease-out
                focus-visible:outline-none
                ${textClass}
                focus-visible:text-[var(--nav-link-hover)]
              `}
            >
              <motion.span
                className="block"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={springFast}
              >
                {item.label}
              </motion.span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
