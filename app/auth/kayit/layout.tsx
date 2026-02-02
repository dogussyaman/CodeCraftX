import type { Metadata } from "next"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Kayıt Ol"),
  description: "Codecrafters topluluğuna katılın. Ücretsiz hesap oluşturun.",
  path: "/auth/kayit",
  noIndex: true,
})

export default function KayitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
