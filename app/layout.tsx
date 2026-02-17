import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeAccentProvider } from "@/components/theme-accent-provider"
import { ReduxProvider } from "@/components/providers/redux-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

const siteTitle = "CodeCraftX - Yetenek ve Fırsatları Buluşturan Platform"
const siteDescription =
  "CV analizi ve beceri eşleştirme algoritması ile geliştiricileri en uygun kariyer fırsatlarıyla buluşturan HR platformu"
const metadataBase =
  typeof process.env.NEXT_PUBLIC_APP_URL === "string" &&
  process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  generator: "v0.app",
  metadataBase,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    siteName: "CodeCraftX",
    ...(metadataBase && { url: metadataBase.origin }),
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  icons: {
    icon: [
      { url: "/CCLOGO.png", type: "image/png", sizes: "32x32" },
      { url: "/CCLOGO.png", type: "image/png", sizes: "any" },
    ],
    apple: "/CCLOGO.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <ThemeAccentProvider>
            <ReduxProvider>
              {children}
            </ReduxProvider>
          </ThemeAccentProvider>
          <Analytics />
          <Toaster />
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
