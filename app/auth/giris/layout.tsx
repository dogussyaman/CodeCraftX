import type { Metadata } from "next"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Giriş Yap"),
  description: "CodeCraftX hesabınıza giriş yapın.",
  path: "/auth/giris",
  noIndex: true,
})

export default function GirisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
