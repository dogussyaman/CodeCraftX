"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getPlanDisplayName } from "@/lib/billing/plans"
import type { CompanyPlan } from "@/lib/types"
import { History, FileText } from "lucide-react"

const STATUS_LABELS: Record<string, string> = {
  pending: "Tamamlanmadı",
  success: "Başarılı",
  failed: "Başarısız",
}

const PROVIDER_LABELS: Record<string, string> = {
  mock: "Test",
  stripe: "Kart (Stripe)",
}

const BILLING_FILTER_OPTIONS = [
  { value: "all", label: "Tümü" },
  { value: "monthly", label: "Aylık" },
  { value: "annually", label: "Yıllık" },
] as const

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-"
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  } catch {
    return "-"
  }
}

function shortId(id: string): string {
  if (!id || id.length < 8) return id
  return id.slice(-8).toUpperCase()
}

export interface PaymentRow {
  id: string
  plan: string
  billing_period: string
  amount: number
  status: string
  provider: string | null
  paid_at: string | null
  created_at: string
  conversation_id?: string | null
  metadata?: Record<string, unknown> | null
}

interface PaymentHistoryCardProps {
  payments: PaymentRow[]
}

export function PaymentHistoryCard({ payments }: PaymentHistoryCardProps) {
  const [billingFilter, setBillingFilter] = useState<"all" | "monthly" | "annually">("all")
  const [detailPayment, setDetailPayment] = useState<PaymentRow | null>(null)

  const filteredPayments = useMemo(() => {
    if (billingFilter === "all") return payments
    return payments.filter((p) => p.billing_period === billingFilter)
  }, [payments, billingFilter])

  return (
    <>
      <Card className="rounded-2xl border border-border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="size-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Ödeme geçmişi</h2>
            </div>
            {payments.length > 0 && (
              <div className="flex gap-1 p-0.5 rounded-lg bg-muted/60">
                {BILLING_FILTER_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={billingFilter === opt.value ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setBillingFilter(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Yukarıdaki fiyat, şu anki aktif aboneliğinize aittir. Tablodaki &quot;Tamamlanmadı&quot; kayıtları, ödeme sayfası açılıp ödeme yapılmadan kapatılan denemelerdir.
          </p>
          {filteredPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Tarih</th>
                    <th className="pb-3 pr-4 font-medium">Plan</th>
                    <th className="pb-3 pr-4 font-medium">Dönem</th>
                    <th className="pb-3 pr-4 font-medium">Tutar</th>
                    <th className="pb-3 pr-4 font-medium">Ödeme yöntemi</th>
                    <th className="pb-3 pr-4 font-medium">Durum</th>
                    <th className="pb-3 w-20" />
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-3 pr-4">
                        {p.paid_at ? formatDate(p.paid_at) : formatDate(p.created_at)}
                      </td>
                      <td className="py-3 pr-4 font-medium">
                        {getPlanDisplayName(p.plan as CompanyPlan)}
                      </td>
                      <td className="py-3 pr-4">
                        {p.billing_period === "annually" ? "Yıllık" : "Aylık"}
                      </td>
                      <td className="py-3 pr-4 font-medium tabular-nums">
                        {Number(p.amount).toLocaleString("tr-TR")} ₺
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {PROVIDER_LABELS[p.provider ?? ""] ?? p.provider ?? "—"}
                      </td>
                      <td className="py-3 pr-4">
                        {STATUS_LABELS[p.status] ?? p.status}
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs gap-1"
                          onClick={() => setDetailPayment(p)}
                        >
                          <FileText className="size-3.5" />
                          Detay
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">
              {payments.length === 0
                ? "Henüz ödeme kaydı bulunmuyor."
                : "Seçilen filtreye uygun kayıt yok."}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detailPayment} onOpenChange={(open) => !open && setDetailPayment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ödeme detayı</DialogTitle>
          </DialogHeader>
          {detailPayment && (
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ödeme no</span>
                <span className="font-mono">{shortId(detailPayment.id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">
                  {getPlanDisplayName(detailPayment.plan as CompanyPlan)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dönem</span>
                <span>{detailPayment.billing_period === "annually" ? "Yıllık" : "Aylık"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tutar</span>
                <span className="font-medium tabular-nums">
                  {Number(detailPayment.amount).toLocaleString("tr-TR")} ₺
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ödeme tarihi</span>
                <span>
                  {detailPayment.paid_at
                    ? formatDate(detailPayment.paid_at)
                    : formatDate(detailPayment.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ödeme yöntemi</span>
                <span>
                  {PROVIDER_LABELS[detailPayment.provider ?? ""] ?? detailPayment.provider ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durum</span>
                <span>{STATUS_LABELS[detailPayment.status] ?? detailPayment.status}</span>
              </div>
              {detailPayment.conversation_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">İşlem no</span>
                  <span className="font-mono text-xs break-all">
                    {detailPayment.conversation_id}
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
