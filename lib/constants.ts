/**
 * MT Dashboard (Müşteri Temsilcisi) giriş sayfası.
 * CodeCraftX'de MT rolüyle giriş yapan kullanıcılar bu URL'e yönlendirilir.
 */
export const MT_DASHBOARD_LOGIN_URL =
  process.env.NEXT_PUBLIC_MT_DASHBOARD_LOGIN_URL ||
  "https://code-crafters-representative-dashbo.vercel.app/auth/v2/login"

/** Tek kaynak: iletişim bilgileri (footer, iletişim, KVKK, Gizlilik vb.) */
export const CONTACT = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@codecraftx.xyz",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@codecraftx.xyz",
  kvkkEmail: process.env.NEXT_PUBLIC_KVKK_EMAIL ?? "kvkk@codecraftx.xyz",
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "Gürsu, Bursa",
} as const

/** Topluluk Discord sunucusu URL'i. Boşsa "Discord'a Katıl" butonu devre dışı gösterilir. */
export const COMMUNITY_DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URL ?? ""

/** Topluluk GitHub organizasyonu/repo URL'i. */
export const COMMUNITY_GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com"

/** Topluluk LinkedIn sayfası URL'i. */
export const COMMUNITY_LINKEDIN_URL = process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://linkedin.com"
