/** Ana navigasyon linkleri. */
export const NAV_ITEMS = [
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/is-ilanlari", label: "İş İlanları" },
  { href: "/isveren", label: "İşveren" },
  { href: "/community", label: "Topluluk" },
  { href: "/iletisim", label: "İletişim" },
] as const;

export const springTransition = { type: "spring" as const, damping: 26, stiffness: 300 };
export const springFast = { type: "spring" as const, damping: 28, stiffness: 400 };
export const springPill = { type: "spring" as const, damping: 24, stiffness: 280 };
