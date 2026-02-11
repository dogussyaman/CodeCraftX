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
import { Banknote, ArrowDownCircle, ArrowUpCircle } from "lucide-react"

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

export default async function AdminGelirGiderPage() {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from("company_payments")
    .select("id, company_id, plan, billing_period, amount, currency, paid_at, created_at, companies(name)")
    .eq("status", "success")
    .order("paid_at", { ascending: false })

  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount ?? 0), 0) ?? 0
  const totalExpense = MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Banknote className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gelir / Gider</h1>
            <p className="text-sm text-muted-foreground">
              Şirket ödemeleri (gelir) ve platform giderleri
            </p>
          </div>
        </div>
      </div>

      {/* Özet kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ArrowDownCircle className="size-4 text-green-600 dark:text-green-400" />
                  Toplam Gelir
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {totalRevenue.toLocaleString("tr-TR")} ₺
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Başarılı şirket abonelik ödemeleri
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ArrowUpCircle className="size-4 text-amber-600 dark:text-amber-400" />
                  Toplam Gider
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {totalExpense.toLocaleString("tr-TR")} ₺
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Mock — henüz gider kaydı yok
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gelir tablosu */}
      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownCircle className="size-5 text-green-600 dark:text-green-400" />
            Gelirler (Şirket Ödemeleri)
          </CardTitle>
          <CardDescription>
            Başarıyla tamamlanan abonelik ödemeleri
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!payments || payments.length === 0 ? (
            <div className="px-6 pb-6">
              <p className="text-sm text-muted-foreground py-8 text-center">
                Henüz gelir kaydı yok.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/30">
                    <TableHead className="px-4 py-3">Tarih</TableHead>
                    <TableHead className="px-4 py-3">Şirket</TableHead>
                    <TableHead className="px-4 py-3">Plan</TableHead>
                    <TableHead className="px-4 py-3">Dönem</TableHead>
                    <TableHead className="px-4 py-3 text-right">Tutar</TableHead>
                    <TableHead className="px-4 py-3">Para birimi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map(
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
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="px-4 py-3 text-muted-foreground">
                          {formatDate(p.paid_at ?? p.created_at)}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-medium">
                          {(p as { companies?: { name: string | null } }).companies?.name ?? "—"}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {PLAN_LABELS[p.plan] ?? p.plan}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {BILLING_LABELS[p.billing_period] ?? p.billing_period}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right font-medium">
                          {Number(p.amount).toLocaleString("tr-TR")}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground">
                          {p.currency ?? "TRY"}
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

      {/* Gider tablosu (mock) */}
      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpCircle className="size-5 text-amber-600 dark:text-amber-400" />
            Giderler
          </CardTitle>
          <CardDescription>
            Platform giderleri (mock — ileride gerçek veri bağlanacak)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {MOCK_EXPENSES.length === 0 ? (
            <div className="px-6 pb-6">
              <p className="text-sm text-muted-foreground py-8 text-center">
                Henüz gider kaydı yok (mock).
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-muted/30">
                    <TableHead className="px-4 py-3">Tarih</TableHead>
                    <TableHead className="px-4 py-3">Açıklama</TableHead>
                    <TableHead className="px-4 py-3 text-right">Tutar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_EXPENSES.map((e, i) => (
                    <TableRow
                      key={i}
                      className="border-b border-border/50 hover:bg-muted/20"
                    >
                      <TableCell className="px-4 py-3 text-muted-foreground">
                        {formatDate(e.date)}
                      </TableCell>
                      <TableCell className="px-4 py-3">{e.description}</TableCell>
                      <TableCell className="px-4 py-3 text-right font-medium">
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
  )
}
