import type { Metadata } from "next"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("İletişim"),
  description: "Codecrafters ile iletişime geçin. Sorularınız, önerileriniz ve iş birliği teklifleriniz için bize ulaşın.",
  path: "/iletisim",
})

export default function IletisimLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
