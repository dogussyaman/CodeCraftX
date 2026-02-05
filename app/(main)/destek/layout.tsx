import type { Metadata } from "next"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Destek"),
  description: "CodeCraftX destek merkezi. Teknik destek, SSS ve bilet oluşturma.",
  path: "/destek",
})

export default function DestekLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
