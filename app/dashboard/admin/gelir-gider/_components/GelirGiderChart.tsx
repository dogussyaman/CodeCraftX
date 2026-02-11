"use client"

import { useState, useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
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
              Tarihe göre günlük gelir ve gider. Toplam: {totalGelir.toLocaleString("tr-TR")} ₺ gelir − {totalGider.toLocaleString("tr-TR")} ₺ gider ={" "}
              <span className={cn("font-medium", net >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                {net.toLocaleString("tr-TR")} ₺ net ({netPercent}%)
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
                    <stop offset="0%" stopColor="hsl(142,76%,36%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(142,76%,36%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillGider" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(38,92%,50%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(38,92%,50%)" stopOpacity={0} />
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
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k ₺` : `${v} ₺`)}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                  }}
                  labelFormatter={(_, payload) =>
                    (payload?.[0]?.payload as ChartDataPoint | undefined)?.dateLabel ?? ""
                  }
                  formatter={(value: number, name: string) => [
                    (value ?? 0).toLocaleString("tr-TR") + " ₺",
                    name === "gelir" ? "Gelir" : name === "gider" ? "Gider" : "Net",
                  ]}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0]?.payload as ChartDataPoint | undefined
                    if (!d) return null
                    return (
                      <div className="rounded-lg border border-border bg-card p-3 shadow-md text-sm">
                        <p className="font-medium text-foreground mb-2">{d.dateLabel}</p>
                        <div className="space-y-1">
                          <p className="text-green-600 dark:text-green-400">
                            Gelir: {d.gelir.toLocaleString("tr-TR")} ₺
                          </p>
                          <p className="text-amber-600 dark:text-amber-400">
                            Gider: {d.gider.toLocaleString("tr-TR")} ₺
                          </p>
                          <p className={cn("font-medium", d.net >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                            Net: {d.net.toLocaleString("tr-TR")} ₺
                          </p>
                        </div>
                      </div>
                    )
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 8 }}
                  formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                />
                <Area
                  type="monotone"
                  dataKey="gelir"
                  name="Gelir"
                  stroke="hsl(142,76%,36%)"
                  strokeWidth={2}
                  fill="url(#fillGelir)"
                />
                <Area
                  type="monotone"
                  dataKey="gider"
                  name="Gider"
                  stroke="hsl(38,92%,50%)"
                  strokeWidth={2}
                  fill="url(#fillGider)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
