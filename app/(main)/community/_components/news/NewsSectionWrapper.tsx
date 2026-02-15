import { Suspense } from "react"
import { getAggregatedNews } from "@/lib/news/aggregate"
import { NewsSection } from "./NewsSection"
import { NewsLoading } from "./NewsLoading"
import { NewsError } from "./NewsError"

const REVALIDATE_SECONDS = 900

async function NewsSectionData() {
  try {
    const data = await getAggregatedNews()
    const hasAny = data.turkish.length > 0 || data.global.length > 0 || data.all.length > 0
    if (!hasAny) {
      return <NewsError message="Şu an haber bulunamadı. Lütfen daha sonra tekrar deneyin." />
    }
    return <NewsSection data={data} />
  } catch {
    return <NewsError />
  }
}

export function NewsSectionWrapper() {
  return (
    <Suspense fallback={<NewsLoading />}>
      <NewsSectionData />
    </Suspense>
  )
}
