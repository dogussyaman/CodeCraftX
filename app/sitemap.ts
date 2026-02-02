import type { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://codecrafters.xyz"

const staticPaths = [
  "",
  "/hakkimizda",
  "/is-ilanlari",
  "/isveren",
  "/blog",
  "/iletisim",
  "/destek",
  "/yorumlar",
  "/haberler",
  "/etkinlikler",
  "/topluluk",
  "/projeler",
  "/terimler",
  "/gizlilik-politikasi",
  "/kvkk",
  "/kullanim-sartlari",
  "/cerez-ayarlari",
  "/auth/giris",
  "/auth/kayit",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return staticPaths.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/is-ilanlari" ? "daily" : path.startsWith("/auth") ? "monthly" : "weekly",
    priority: path === "" ? 1 : path === "/is-ilanlari" || path === "/isveren" ? 0.9 : 0.8,
  }))
}
