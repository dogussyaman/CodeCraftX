"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getPlanDisplayName } from "@/lib/billing/plans"
import type { CompanyPlan } from "@/lib/types"
import {
  CheckCircle2,
  Clock,
  XCircle,
  History,
  CreditCard,
  Calendar,
  ChevronRight,
  TrendingUp,
} from "lucide-react"

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; cls: string; dotCls: string }> = {
  success: { label: "Başarılı", icon: CheckCircle2, cls: "text-emerald-600 dark:text-emerald-400", dotCls: "bg-emerald-500" },
  pending: { label: "Tamamlanmadı", icon: Clock, cls: "text-amber-600 dark:text-amber-400", dotCls: "bg-amber-400" },
  failed: { label: "Başarısız", icon: XCircle, cls: "text-red-600 dark:text-red-400", dotCls: "bg-red-500" },
}

const PROVIDER_LABELS: Record<string, string> = {
  mock: "Test",
  stripe: "Stripe",
}

const PERIOD_LABELS: Record<string, string> = {
  monthly: "Aylık",
  annually: "Yıllık",
}

const FILTER_OPTIONS = [
  { value: "all", label: "Tümü" },
  { value: "monthly", label: "Aylık" },
  { value: "annually", label: "Yıllık" },
] as const

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

function formatDate(iso: string | null | undefined, short = false): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("tr-TR", short
      ? { day: "numeric", month: "short" }
      : { day: "numeric", month: "long", year: "numeric" }
    )
  } catch {
    return "—"
  }
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return ""
  try {
    return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
  } catch {
    return ""
  }
}

function shortId(id: string): string {
  if (!id || id.length < 8) return id
  return "#" + id.slice(-6).toUpperCase()
}

function groupByMonth(payments: PaymentRow[]) {
  const groups: Record<string, PaymentRow[]> = {}
  payments.forEach((p) => {
    const date = new Date(p.paid_at ?? p.created_at)
    const key = date.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })
    if (!groups[key]) groups[key] = []
    groups[key].push(p)
  })
  return Object.entries(groups)
}

export function PaymentHistoryCard({ payments }: { payments: PaymentRow[] }) {
  const [filter, setFilter] = useState<"all" | "monthly" | "annually">("all")
  const [detail, setDetail] = useState<PaymentRow | null>(null)

  const filtered = useMemo(() => {
    if (filter === "all") return payments
    return payments.filter((p) => p.billing_period === filter)
  }, [payments, filter])

  const grouped = useMemo(() => groupByMonth(filtered), [filtered])

  const successTotal = useMemo(
    () => filtered.filter((p) => p.status === "success").reduce((s, p) => s + Number(p.amount ?? 0), 0),
    [filtered]
  )

  return (
    <>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Başlık */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-muted/60 p-2">
              <History className="size-4 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">İşlem Geçmişi</h2>
              <p className="text-xs text-muted-foreground">
                {filtered.length} kayıt
                {successTotal > 0 && ` · Toplam ${successTotal.toLocaleString("tr-TR")} ₺`}
              </p>
            </div>
          </div>

          {payments.length > 0 && (
            <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border self-start sm:self-auto">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filter === opt.value
                      ? "bg-background text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* İçerik */}
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto size-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
              <CreditCard className="size-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">
              {payments.length === 0 ? "Henüz ödeme kaydı bulunmuyor." : "Bu filtreye uygun kayıt yok."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {grouped.map(([month, rows]) => {
              const monthTotal = rows.filter((r) => r.status === "success").reduce((s, r) => s + Number(r.amount ?? 0), 0)
              return (
                <div key={month}>
                  {/* Ay başlığı */}
                  <div className="flex items-center justify-between px-6 py-2.5 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground">{month}</span>
                    </div>
                    {monthTotal > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {monthTotal.toLocaleString("tr-TR")} ₺
                      </span>
                    )}
                  </div>

                  {/* Satırlar */}
                  {rows.map((p) => {
                    const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.failed
                    const StatusIcon = cfg.icon
                    const dateStr = p.paid_at ?? p.created_at
                    return (
                      <button
                        key={p.id}
                        onClick={() => setDetail(p)}
                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors text-left group"
                      >
                        {/* İkon */}
                        <div className={`rounded-xl p-2.5 shrink-0 ${
                          p.status === "success"
                            ? "bg-emerald-500/10"
                            : p.status === "pending"
                              ? "bg-amber-500/10"
                              : "bg-red-500/10"
                        }`}>
                          <StatusIcon className={`size-4 ${cfg.cls}`} />
                        </div>

                        {/* Bilgi */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">
                              {getPlanDisplayName(p.plan as CompanyPlan)} — {PERIOD_LABELS[p.billing_period] ?? p.billing_period}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 h-4 hidden sm:inline-flex ${
                                p.status === "success"
                                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                                  : p.status === "pending"
                                    ? "border-amber-500/30 text-amber-600 dark:text-amber-400"
                                    : "border-red-500/30 text-red-600 dark:text-red-400"
                              }`}
                            >
                              {cfg.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-muted-foreground">
                              {formatDate(dateStr, true)} {formatTime(dateStr)}
                            </p>
                            <span className="text-muted-foreground/30">·</span>
                            <p className="text-xs text-muted-foreground font-mono">{shortId(p.id)}</p>
                            <span className="text-muted-foreground/30">·</span>
                            <p className="text-xs text-muted-foreground">
                              {PROVIDER_LABELS[p.provider ?? ""] ?? (p.provider ?? "—")}
                            </p>
                          </div>
                        </div>

                        {/* Tutar */}
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-bold tabular-nums ${
                            p.status === "success"
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}>
                            {p.status === "success" ? "" : ""}
                            {Number(p.amount).toLocaleString("tr-TR")} ₺
                          </p>
                          <ChevronRight className="size-3.5 text-muted-foreground/40 ml-auto mt-0.5 group-hover:text-muted-foreground transition-colors" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}

        {/* Alt özet */}
        {successTotal > 0 && (
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="size-3.5" />
              <span>Toplam başarılı ödeme</span>
            </div>
            <span className="text-sm font-bold tabular-nums text-foreground">
              {successTotal.toLocaleString("tr-TR")} ₺
            </span>
          </div>
        )}
      </div>

      {/* Detay Modal */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="size-4" />
              Ödeme Detayı
            </DialogTitle>
          </DialogHeader>
          {detail && (() => {
            const cfg = STATUS_CONFIG[detail.status] ?? STATUS_CONFIG.failed
            const StatusIcon = cfg.icon
            return (
              <div className="space-y-4">
                <div className={`rounded-xl p-4 flex items-center gap-3 ${
                  detail.status === "success"
                    ? "bg-emerald-500/10"
                    : detail.status === "pending"
                      ? "bg-amber-500/10"
                      : "bg-red-500/10"
                }`}>
                  <StatusIcon className={`size-5 ${cfg.cls}`} />
                  <div>
                    <p className="font-semibold text-sm">{cfg.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(detail.paid_at ?? detail.created_at)} {formatTime(detail.paid_at ?? detail.created_at)}
                    </p>
                  </div>
                  <p className="ml-auto text-xl font-bold tabular-nums">
                    {Number(detail.amount).toLocaleString("tr-TR")} ₺
                  </p>
                </div>

                <div className="space-y-2.5 text-sm">
                  <DetailRow label="İşlem No" value={shortId(detail.id)} mono />
                  <DetailRow label="Plan" value={getPlanDisplayName(detail.plan as CompanyPlan)} />
                  <DetailRow label="Dönem" value={PERIOD_LABELS[detail.billing_period] ?? detail.billing_period} />
                  <DetailRow label="Ödeme Yöntemi" value={PROVIDER_LABELS[detail.provider ?? ""] ?? detail.provider ?? "—"} />
                  {detail.paid_at && (
                    <DetailRow label="Ödeme Tarihi" value={formatDate(detail.paid_at)} />
                  )}
                  <DetailRow label="Oluşturulma" value={formatDate(detail.created_at)} />
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  )
}
