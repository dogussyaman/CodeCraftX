import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CommunityHeroSkeleton } from "./_components/CommunityHeroSkeleton"
import { CommunitySidebarSkeleton } from "./_components/CommunitySidebarSkeleton"
import { CommunityFeedsSkeleton } from "./_components/CommunityFeedsSkeleton"
import { CommunityRightSidebarSkeleton } from "./_components/CommunityRightSidebarSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function CommunityLoading() {
  return (
    <div className="min-h-screen bg-background">
      <CommunityHeroSkeleton />

      <div className="container mx-auto px-4 py-6 md:py-8">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Ana Sayfa</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Topluluk</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
          <CommunitySidebarSkeleton />
          <CommunityFeedsSkeleton />
          <CommunityRightSidebarSkeleton />
        </div>

        <section className="mt-16 border-t border-border pt-12">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-72" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="aspect-video w-full rounded-lg" />
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-border bg-muted/20 p-8 md:p-12">
          <div className="flex flex-col items-center text-center">
            <Skeleton className="size-14 rounded-2xl" />
            <Skeleton className="mt-4 h-8 w-64" />
            <Skeleton className="mt-2 h-5 w-96 max-w-full" />
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Skeleton className="h-10 w-32 rounded-md" />
              <Skeleton className="h-10 w-36 rounded-md" />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
