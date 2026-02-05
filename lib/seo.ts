import type { Metadata } from "next"

const SITE_NAME = "CodeCraftX"
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? ""

export interface PageSeoOptions {
  title: string
  description: string
  path: string
  image?: string
  noIndex?: boolean
}

/**
 * Sayfa bazlı SEO meta verisi üretir.
 * canonical, robots, openGraph, twitter card tek yerden yönetilir.
 */
export function buildPageMetadata(options: PageSeoOptions): Metadata {
  const { title, description, path, image, noIndex } = options
  const canonical = BASE_URL ? `${BASE_URL}${path}` : undefined

  return {
    title,
    description,
    robots: noIndex ? { index: false, follow: false } : undefined,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      siteName: SITE_NAME,
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
  }
}

export function getSiteTitle(suffix?: string): string {
  const base = `${SITE_NAME} - Yetenek ve Fırsatları Buluşturan Platform`
  return suffix ? `${suffix} | ${base}` : base
}
