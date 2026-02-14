import type { Metadata } from "next"
import { buildPageMetadata, getSiteTitle } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata({
  title: getSiteTitle("Şifremi Unuttum"),
  description: "Şifre sıfırlama bağlantısı alın.",
  path: "/auth/sifre-unuttum",
  noIndex: true,
})

export default function SifreUnuttumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
