import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CommunityHero } from "./_components/CommunityHero"
import { CommunitySidebarSkeleton } from "./_components/CommunitySidebarSkeleton"
import { CommunityFeedsSkeleton } from "./_components/CommunityFeedsSkeleton"
import { CommunityRightSidebarSkeleton } from "./_components/CommunityRightSidebarSkeleton"

export default function CommunityLoading() {
  return (
    <div className="min-h-screen bg-background">
      <CommunityHero />

      <div className="container mx-auto px-4 py-6 pt-8 md:py-8 md:pt-10">
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
      </div>
    </div>
  )
}
