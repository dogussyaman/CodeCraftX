"use client"

import { useState, useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ChartDataPoint = {
  date: string
  dateLabel: string
  gelir: number
  gider: number
  net: number
}

const RANGES = [
  { id: "7", label: "7 Gün" },
  { id: "30", label: "1 Ay" },
  { id: "90", label: "3 Ay" },
  { id: "180", label: "6 Ay" },
  { id: "365", label: "1 Yıl" },
  { id: "all", label: "Tümü" },
] as const

type RangeId = (typeof RANGES)[number]["id"]

interface GelirGiderChartProps {
  data: ChartDataPoint[]
  totalGelir: number
  totalGider: number
}

export function GelirGiderChart({ data, totalGelir, totalGider }: GelirGiderChartProps) {
  const [range, setRange] = useState<RangeId>("30")

  const filteredData = useMemo(() => {
    if (range === "all" || data.length === 0) return data
    const n = parseInt(range, 10)
    return data.slice(-n)
  }, [data, range])

  const net = totalGelir - totalGider
  const netPercent =
    totalGelir > 0 ? ((net / totalGelir) * 100).toFixed(1) : "0"

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Gelir / Gider Özeti</CardTitle>
            <CardDescription className="mt-1">
              Toplam bakiye {totalGelir.toLocaleString("tr-TR")} ₺ − {totalGider.toLocaleString("tr-TR")} ₺ ={" "}
              <span className={cn("font-medium", net >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                {net.toLocaleString("tr-TR")} ₺ ({netPercent}%)
              </span>
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-1">
            {RANGES.map((r) => (
              <Button
                key={r.id}
                variant={range === r.id ? "default" : "outline"}
                size="sm"
                className="rounded-md h-8 px-3"
                onClick={() => setRange(r.id)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[280px] w-full">
          {filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Seçilen dönemde veri yok.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredData}
                margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
              >
                <defs>
                  <linearGradient id="fillGelir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                  }}
                  formatter={(value: number) => [value.toLocaleString("tr-TR") + " ₺", "Gelir"]}
                  labelFormatter={(_, payload) =>
                    (payload?.[0]?.payload as ChartDataPoint | undefined)?.dateLabel ?? ""
                  }
                />
                <Area
                  type="monotone"
                  dataKey="gelir"
                  name="Gelir"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#fillGelir)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
