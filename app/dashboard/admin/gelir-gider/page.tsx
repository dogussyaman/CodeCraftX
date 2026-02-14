import { createClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Banknote, ArrowDownCircle, ArrowUpCircle, TrendingUp } from "lucide-react"
import { GelirGiderChart, type ChartDataPoint } from "./_components/GelirGiderChart"

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

const PLAN_LABELS: Record<string, string> = {
  free: "Ücretsiz",
  orta: "Orta",
  premium: "Premium",
}

const BILLING_LABELS: Record<string, string> = {
  monthly: "Aylık",
  annually: "Yıllık",
}

/** Mock gider kayıtları (ileride platform_expenses tablosu ile değiştirilebilir) */
const MOCK_EXPENSES: { description: string; amount: number; date: string }[] = []

function buildChartData(
  payments: { paid_at: string | null; created_at: string; amount: number }[]
): ChartDataPoint[] {
  const byDate = new Map<string, { gelir: number; gider: number }>()
  for (const p of payments) {
    const raw = p.paid_at ?? p.created_at
    const d = new Date(raw)
    const key = d.toISOString().slice(0, 10)
    const current = byDate.get(key) ?? { gelir: 0, gider: 0 }
    current.gelir += Number(p.amount ?? 0)
    byDate.set(key, current)
  }
  MOCK_EXPENSES.forEach((e) => {
    const key = e.date.slice(0, 10)
    const current = byDate.get(key) ?? { gelir: 0, gider: 0 }
    current.gider += e.amount
    byDate.set(key, current)
  })
  const sorted = Array.from(byDate.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  return sorted.map(([date, { gelir, gider }]) => ({
    date,
    dateLabel: new Date(date + "Z").toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
    }),
    gelir,
    gider,
    net: gelir - gider,
  }))
}

export default async function AdminGelirGiderPage() {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from("company_payments")
    .select("id, company_id, plan, billing_period, amount, currency, paid_at, created_at, companies(name)")
    .eq("status", "success")
    .order("paid_at", { ascending: false })

  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount ?? 0), 0) ?? 0
  const totalExpense = MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0)
  const net = totalRevenue - totalExpense
  const chartData = buildChartData(payments ?? [])

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Banknote className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gelir / Gider</h1>
            <p className="text-sm text-muted-foreground">
              Şirket ödemeleri ve platform giderleri — özet ve grafik
            </p>
          </div>
        </div>
      </div>

      {/* Üst satır: 3 özet kartı (referans görseldeki Balance / asset kartları gibi) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownCircle className="size-4 text-green-600 dark:text-green-400" />
              Toplam Gelir
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {totalRevenue.toLocaleString("tr-TR")} ₺
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Başarılı abonelik ödemeleri
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUpCircle className="size-4 text-amber-600 dark:text-amber-400" />
              Toplam Gider
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {totalExpense.toLocaleString("tr-TR")} ₺
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Mock — gider kaydı yok
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Net
            </p>
            <p
              className={`text-2xl font-bold mt-1 ${net >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              {net.toLocaleString("tr-TR")} ₺
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Gelir − Gider
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafik kartı (zaman aralığı + alan grafiği) */}
      <GelirGiderChart
        data={chartData}
        totalGelir={totalRevenue}
        totalGider={totalExpense}
      />

      {/* Detay tabloları */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowDownCircle className="size-5 text-green-600 dark:text-green-400" />
              Gelirler (Şirket Ödemeleri)
            </CardTitle>
            <CardDescription>Son başarılı ödemeler</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {!payments || payments.length === 0 ? (
              <div className="px-6 pb-6">
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Henüz gelir kaydı yok.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border bg-muted/30">
                      <TableHead className="px-4 py-2 text-xs">Tarih</TableHead>
                      <TableHead className="px-4 py-2 text-xs">Şirket</TableHead>
                      <TableHead className="px-4 py-2 text-xs">Plan</TableHead>
                      <TableHead className="px-4 py-2 text-xs text-right">Tutar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.slice(0, 20).map(
                      (p: {
                        id: string
                        paid_at: string | null
                        created_at: string
                        plan: string
                        billing_period: string
                        amount: number
                        currency: string
                        companies?: { name: string | null } | null
                      }) => (
                        <TableRow
                          key={p.id}
                          className="border-b border-border/50 hover:bg-muted/20"
                        >
                          <TableCell className="px-4 py-2 text-xs text-muted-foreground">
                            {formatDate(p.paid_at ?? p.created_at)}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-xs font-medium">
                            {(p as { companies?: { name: string | null } }).companies?.name ?? "—"}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-xs">
                            {PLAN_LABELS[p.plan] ?? p.plan} · {BILLING_LABELS[p.billing_period] ?? p.billing_period}
                          </TableCell>
                          <TableCell className="px-4 py-2 text-xs text-right font-medium">
                            {Number(p.amount).toLocaleString("tr-TR")} ₺
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowUpCircle className="size-5 text-amber-600 dark:text-amber-400" />
              Giderler
            </CardTitle>
            <CardDescription>Platform giderleri (mock)</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {MOCK_EXPENSES.length === 0 ? (
              <div className="px-6 pb-6">
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Henüz gider kaydı yok (mock).
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border bg-muted/30">
                      <TableHead className="px-4 py-2 text-xs">Tarih</TableHead>
                      <TableHead className="px-4 py-2 text-xs">Açıklama</TableHead>
                      <TableHead className="px-4 py-2 text-xs text-right">Tutar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_EXPENSES.map((e, i) => (
                      <TableRow key={i} className="border-b border-border/50 hover:bg-muted/20">
                        <TableCell className="px-4 py-2 text-xs text-muted-foreground">
                          {formatDate(e.date)}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-xs">{e.description}</TableCell>
                        <TableCell className="px-4 py-2 text-xs text-right font-medium">
                          {e.amount.toLocaleString("tr-TR")} ₺
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
