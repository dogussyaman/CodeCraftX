import type { Metadata } from "next"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Kimlik Doğrulama Hatası"),
  description: "Kimlik doğrulama sırasında bir sorun oluştu.",
  path: "/auth/hata",
  noIndex: true,
})

export default function HataLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
