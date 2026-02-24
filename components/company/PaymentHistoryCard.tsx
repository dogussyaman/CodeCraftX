"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  TrendingUp,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const PAGE_SIZE = 10

const STATUS_CONFIG: Record<string, {
  label: string
  icon: typeof CheckCircle2
  cls: string
  badgeCls: string
}> = {
  success: {
    label: "Başarılı",
    icon: CheckCircle2,
    cls: "text-emerald-600 dark:text-emerald-400",
    badgeCls: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5",
  },
  pending: {
    label: "Tamamlanmadı",
    icon: Clock,
    cls: "text-amber-600 dark:text-amber-400",
    badgeCls: "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5",
  },
  failed: {
    label: "Başarısız",
    icon: XCircle,
    cls: "text-red-600 dark:text-red-400",
    badgeCls: "border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/5",
  },
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
  { value: "success", label: "Başarılı" },
  { value: "pending", label: "Bekleyen" },
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
  metadata?: Record<string, unknown> | null
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch { return "—" }
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return ""
  try {
    return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
  } catch { return "" }
}

function shortId(id: string): string {
  if (!id || id.length < 6) return id
  return "#" + id.slice(-6).toUpperCase()
}

export function PaymentHistoryCard({ payments: initialPayments }: { payments?: PaymentRow[] }) {
  const [payments, setPayments] = useState<PaymentRow[]>(initialPayments ?? [])
  const [loading, setLoading] = useState(!initialPayments)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "success" | "pending">("all")
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState<PaymentRow | null>(null)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/company/payments", { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) { setError(json?.error ?? "Veriler yüklenemedi"); return }
      setPayments(json.payments ?? [])
    } catch {
      setError("Ağ hatası, lütfen tekrar deneyin")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  // filtre değişince ilk sayfaya dön
  const filtered = useMemo(() => {
    if (filter === "all") return payments
    if (filter === "success") return payments.filter((p) => p.status === "success")
    return payments.filter((p) => p.status === "pending" || p.status === "failed")
  }, [payments, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const successTotal = useMemo(
    () => payments.filter((p) => p.status === "success").reduce((s, p) => s + Number(p.amount ?? 0), 0),
    [payments]
  )
  const successCount = useMemo(() => payments.filter((p) => p.status === "success").length, [payments])

  const handleFilterChange = (v: typeof filter) => { setFilter(v); setPage(1) }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">

        {/* ── Başlık ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-muted/60 p-2">
              <History className="size-4 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">İşlem Geçmişi</h2>
              {!loading && (
                <p className="text-xs text-muted-foreground">
                  {filtered.length} kayıt
                  {successTotal > 0 && (
                    <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-medium">
                      · {successTotal.toLocaleString("tr-TR")} ₺ başarılı
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchPayments}
              disabled={loading}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="Yenile"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <div className="flex gap-0.5 p-0.5 rounded-lg bg-muted/50 border border-border">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleFilterChange(opt.value)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    filter === opt.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── İçerik ─────────────────────────────────── */}
        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="size-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Yükleniyor…</p>
          </div>
        ) : error ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="rounded-xl bg-destructive/10 p-3">
              <AlertCircle className="size-5 text-destructive" />
            </div>
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchPayments}>Tekrar Dene</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-14 text-center">
            <div className="mx-auto size-10 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
              <CreditCard className="size-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">
              {payments.length === 0 ? "Henüz ödeme kaydı bulunmuyor." : "Bu filtreye uygun kayıt yok."}
            </p>
          </div>
        ) : (
          <>
            {/* Tablo başlığı */}
            <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-2.5 bg-muted/30 border-b border-border/50 text-xs font-medium text-muted-foreground">
              <span>İşlem</span>
              <span>Tarih</span>
              <span>Dönem</span>
              <span>Tutar</span>
              <span>Durum</span>
            </div>

            {/* Satırlar */}
            <div className="divide-y divide-border/40">
              {paginated.map((p) => {
                const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.failed
                const StatusIcon = cfg.icon
                const dateStr = p.paid_at ?? p.created_at
                return (
                  <button
                    key={p.id}
                    onClick={() => setDetail(p)}
                    className="w-full grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-2 sm:gap-4 items-center px-6 py-3.5 hover:bg-muted/30 transition-colors text-left group"
                  >
                    {/* Plan + ID */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`rounded-lg p-1.5 shrink-0 bg-muted/60`}>
                        <CreditCard className="size-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {getPlanDisplayName(p.plan as CompanyPlan)}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">{shortId(p.id)}</p>
                      </div>
                    </div>

                    {/* Tarih */}
                    <div>
                      <p className="text-sm text-foreground">{formatDate(dateStr)}</p>
                      <p className="text-[11px] text-muted-foreground">{formatTime(dateStr)}</p>
                    </div>

                    {/* Dönem */}
                    <p className="text-sm text-muted-foreground">
                      {PERIOD_LABELS[p.billing_period] ?? p.billing_period}
                    </p>

                    {/* Tutar */}
                    <p className={`text-sm font-semibold tabular-nums ${
                      p.status === "success" ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {Number(p.amount).toLocaleString("tr-TR")} ₺
                    </p>

                    {/* Durum */}
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 gap-1 ${cfg.badgeCls}`}
                      >
                        <StatusIcon className="size-2.5" />
                        <span className="hidden sm:inline">{cfg.label}</span>
                      </Badge>
                      <ChevronRight className="size-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* ── Sayfalama ─────────────────────────────── */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length} kayıt
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                .reduce<(number | "…")[]>((acc, n, i, arr) => {
                  if (i > 0 && (n as number) - (arr[i - 1] as number) > 1) acc.push("…")
                  acc.push(n)
                  return acc
                }, [])
                .map((n, i) =>
                  n === "…" ? (
                    <span key={`dots-${i}`} className="px-1 text-xs text-muted-foreground">…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n as number)}
                      className={`size-7 rounded-lg text-xs font-medium transition-all ${
                        safePage === n
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      {n}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Alt özet (1 sayfa varsa) ──────────────── */}
        {!loading && !error && successTotal > 0 && totalPages <= 1 && (
          <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="size-3.5" />
              <span>{successCount} başarılı ödeme</span>
            </div>
            <span className="text-sm font-bold tabular-nums">{successTotal.toLocaleString("tr-TR")} ₺</span>
          </div>
        )}
      </div>

      {/* ── Detay Modal ───────────────────────────── */}
      <Dialog open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <CreditCard className="size-4" />
              Ödeme Detayı
            </DialogTitle>
          </DialogHeader>
          {detail && (() => {
            const cfg = STATUS_CONFIG[detail.status] ?? STATUS_CONFIG.failed
            const StatusIcon = cfg.icon
            const dateStr = detail.paid_at ?? detail.created_at
            return (
              <div className="space-y-3">
                <div className={`rounded-xl p-3.5 flex items-center gap-3 border ${cfg.badgeCls}`}>
                  <StatusIcon className={`size-5 shrink-0 ${cfg.cls}`} />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{cfg.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(dateStr)} {formatTime(dateStr)}
                    </p>
                  </div>
                  <p className="text-lg font-bold tabular-nums shrink-0">
                    {Number(detail.amount).toLocaleString("tr-TR")} ₺
                  </p>
                </div>
                <div className="divide-y divide-border/50">
                  <DetailRow label="İşlem No" value={shortId(detail.id)} mono />
                  <DetailRow label="Plan" value={getPlanDisplayName(detail.plan as CompanyPlan)} />
                  <DetailRow label="Dönem" value={PERIOD_LABELS[detail.billing_period] ?? detail.billing_period} />
                  <DetailRow label="Ödeme Yöntemi" value={PROVIDER_LABELS[detail.provider ?? ""] ?? (detail.provider ?? "—")} />
                  {detail.paid_at && <DetailRow label="Ödeme Tarihi" value={formatDate(detail.paid_at)} />}
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
    <div className="flex items-center justify-between py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  )
}
