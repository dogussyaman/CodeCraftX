import type { Metadata } from "next"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Çerez Ayarları"),
  description: "CodeCraftX çerez tercihlerinizi yönetin. Zorunlu, analitik ve pazarlama çerezleri.",
  path: "/cerez-ayarlari",
})

export default function CerezAyarlariLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
