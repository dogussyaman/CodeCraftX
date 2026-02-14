import type { Metadata } from "next"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("E-posta Onayı"),
  description: "E-posta adresinizi onaylayın.",
  path: "/auth/onay-bekliyor",
  noIndex: true,
})

export default function OnayBekliyorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
