import type { Metadata } from "next"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Şifre Sıfırla"),
  description: "Yeni şifrenizi belirleyin.",
  path: "/auth/sifre-sifirla",
  noIndex: true,
})

export default function SifreSifirlaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
