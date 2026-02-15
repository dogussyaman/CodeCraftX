import { NextResponse } from "next/server"
import { getAggregatedNews } from "@/lib/news/aggregate"

export const dynamic = "force-dynamic"
export const revalidate = 900

export async function GET() {
  try {
    const data = await getAggregatedNews()
    return NextResponse.json(data)
  } catch (err) {
    console.error("[api/news/aggregate]", err)
    return NextResponse.json(
      { turkish: [], global: [], all: [] },
      { status: 200 }
    )
  }
}
