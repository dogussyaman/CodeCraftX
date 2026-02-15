"use client"

import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Sparkles, Link2 } from "lucide-react"
import {
  COMMUNITY_DISCORD_URL,
  COMMUNITY_GITHUB_URL,
  COMMUNITY_LINKEDIN_URL,
} from "@/lib/constants"

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  )
}

export function CommunityRightSidebarSkeleton() {
  return (
    <aside className="flex w-full flex-col gap-6 lg:w-[280px] lg:shrink-0">
      {/* Yaklaşan Etkinlikler - kart ve başlık hemen, sadece liste (backend) skeleton */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Yaklaşan Etkinlikler</h3>
            <Button variant="ghost" size="icon" asChild className="size-8">
              <Link href="/etkinlikler" aria-label="Tümünü gör">
                <MoreHorizontal className="size-4" />
              </Link>
            </Button>
          </div>
          <ul className="mt-3 space-y-3">
            {[1, 2, 3].map((i) => (
              <li key={i} className="flex gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <Skeleton className="size-10 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </li>
            ))}
          </ul>
          <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
            <Link href="/etkinlikler">Tüm etkinlikler</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Öne çıkan blog yazıları - başlık hemen, sadece liste (backend) skeleton */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="size-4 text-primary" />
            Öne çıkan blog yazıları
          </h3>
          <ul className="mt-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <li key={i}>
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="ml-2 mt-1 h-3 w-20" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Entegrasyonlar - tamamen statik, hemen */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Link2 className="size-4 text-primary" />
            Entegrasyonlar
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Topluluğu kullandığınız araçlarla bağlayın.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <a
              href={COMMUNITY_DISCORD_URL || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-12 items-center justify-center rounded-full border border-border bg-muted/30 text-foreground transition-colors hover:bg-muted hover:text-primary disabled:pointer-events-none disabled:opacity-50"
              title="Discord"
              aria-label="Discord"
            >
              <DiscordIcon className="size-6" />
            </a>
            <a
              href={COMMUNITY_GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-12 items-center justify-center rounded-full border border-border bg-muted/30 text-foreground transition-colors hover:bg-muted hover:text-primary"
              title="GitHub"
              aria-label="GitHub"
            >
              <svg className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href={COMMUNITY_LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-12 items-center justify-center rounded-full border border-border bg-muted/30 text-foreground transition-colors hover:bg-muted hover:text-primary"
              title="LinkedIn"
              aria-label="LinkedIn"
            >
              <svg className="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}
