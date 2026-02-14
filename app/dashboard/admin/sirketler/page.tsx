"use client"

import { Fragment, useState, useEffect } from "react"
import { Building2, Search, Plus, Pencil, Eye, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { Company, SubscriptionStatus } from "@/lib/types"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type CompanyWithExtras = Company & { contact_email?: string | null }

const SUBSCRIPTION_LABELS: Record<SubscriptionStatus, string> = {
  pending_payment: "Ödeme Bekleniyor",
  active: "Aktif",
  past_due: "Gecikmiş",
  cancelled: "İptal",
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-"
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return "-"
  }
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyWithExtras[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | SubscriptionStatus>("all")
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null)
  const supabase = createClient()

    useEffect(() => {
        fetchCompanies()
    }, [])

    const fetchCompanies = async () => {
        try {
            const { data, error } = await supabase
                .from("companies")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) throw error
            setCompanies(data || [])
        } catch (error) {
            console.error("Şirketler yüklenirken hata:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredCompanies = companies
        .filter((company) =>
            company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.industry?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .filter((company) =>
            statusFilter === "all" ? true : company.subscription_status === statusFilter
        )

    return (
        <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-primary/10 p-3">
                        <Building2 className="size-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Şirketler</h1>
                        <p className="text-sm text-muted-foreground">
                            Platformdaki tüm şirketleri görüntüleyin ve yönetin
                        </p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/dashboard/admin/sirketler/olustur">
                        <Plus className="size-4 mr-2" />
                        Yeni Şirket
                    </Link>
                </Button>
            </div>

            <Card className="rounded-2xl border border-border bg-card shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Tüm Şirketler</CardTitle>
                            <CardDescription>
                                {filteredCompanies.length} şirket bulundu
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="mb-6 px-6 space-y-3">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Şirket adı veya sektör ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground mr-1">Filtre:</span>
                            <Button
                                size="sm"
                                variant={statusFilter === "all" ? "default" : "outline"}
                                onClick={() => setStatusFilter("all")}
                            >
                                Tümü
                            </Button>
                            <Button
                                size="sm"
                                variant={statusFilter === "active" ? "default" : "outline"}
                                onClick={() => setStatusFilter("active")}
                            >
                                Aktif abonelik
                            </Button>
                            <Button
                                size="sm"
                                variant={statusFilter === "pending_payment" ? "default" : "outline"}
                                onClick={() => setStatusFilter("pending_payment")}
                            >
                                Ödeme bekleyenler
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-b-2xl overflow-hidden border-t border-border">
                        {loading ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                                        <TableHead className="w-10 px-4 py-3"> </TableHead>
                                        <TableHead className="px-4 py-3">Şirket Adı</TableHead>
                                        <TableHead className="px-4 py-3">Sektör</TableHead>
                                        <TableHead className="px-4 py-3">Çalışan</TableHead>
                                        <TableHead className="px-4 py-3">Konum</TableHead>
                                        <TableHead className="px-4 py-3">Plan</TableHead>
                                        <TableHead className="px-4 py-3">Abonelik</TableHead>
                                        <TableHead className="px-4 py-3">Son Ödeme</TableHead>
                                        <TableHead className="text-right px-4 py-3">İşlemler</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="border-border">
                                            {Array.from({ length: 9 }).map((_, j) => (
                                                <TableCell key={j} className="px-4 py-3">
                                                    <Skeleton className="h-4 w-full" />
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : filteredCompanies.length === 0 ? (
                            <div className="py-12 text-center">
                                <Building2 className="size-16 mx-auto mb-4 text-muted-foreground/50" />
                                <p className="text-muted-foreground">
                                    {searchQuery ? "Arama kriterlerine uygun şirket bulunamadı" : "Henüz şirket eklenmemiş"}
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                                        <TableHead className="w-10 px-4 py-3"> </TableHead>
                                        <TableHead className="px-4 py-3">Şirket Adı</TableHead>
                                        <TableHead className="px-4 py-3">Sektör</TableHead>
                                        <TableHead className="px-4 py-3">Çalışan</TableHead>
                                        <TableHead className="px-4 py-3">Konum</TableHead>
                                        <TableHead className="px-4 py-3">Plan</TableHead>
                                        <TableHead className="px-4 py-3">Abonelik</TableHead>
                                        <TableHead className="px-4 py-3">Son Ödeme</TableHead>
                                        <TableHead className="text-right px-4 py-3">İşlemler</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCompanies.map((company) => (
                                        <Fragment key={company.id}>
                                            <TableRow
                                                className={cn(
                                                    "border-border cursor-pointer transition-colors hover:bg-muted/50",
                                                    expandedCompanyId === company.id && "bg-muted/30"
                                                )}
                                                onClick={() => setExpandedCompanyId(expandedCompanyId === company.id ? null : company.id)}
                                            >
                                                <TableCell className="w-10 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        type="button"
                                                        className="flex items-center justify-center rounded p-1 hover:bg-muted"
                                                        onClick={() => setExpandedCompanyId(expandedCompanyId === company.id ? null : company.id)}
                                                        aria-label={expandedCompanyId === company.id ? "Detayı kapat" : "Detayı aç"}
                                                    >
                                                        <ChevronRight
                                                            className={cn("size-4 text-muted-foreground transition-transform", expandedCompanyId === company.id && "rotate-90")}
                                                        />
                                                    </button>
                                                </TableCell>
                                                <TableCell className="font-medium px-4 py-3">{company.name}</TableCell>
                                                <TableCell className="px-4 py-3">{company.industry || "-"}</TableCell>
                                                <TableCell className="px-4 py-3">{company.employee_count || "-"}</TableCell>
                                                <TableCell className="px-4 py-3">{company.location || "-"}</TableCell>
                                                <TableCell className="px-4 py-3">
                                                    {company.plan ? (
                                                        <Badge variant="secondary" className="capitalize">
                                                            {company.plan === "orta" ? "Orta" : company.plan === "premium" ? "Premium" : "Free"}
                                                        </Badge>
                                                    ) : "-"}
                                                </TableCell>
                                                <TableCell className="px-4 py-3">
                                                    {company.subscription_status ? (
                                                        <Badge
                                                            variant={
                                                                company.subscription_status === "active"
                                                                    ? "success"
                                                                    : company.subscription_status === "pending_payment"
                                                                        ? "warning"
                                                                        : company.subscription_status === "past_due"
                                                                            ? "destructive"
                                                                            : "secondary"
                                                            }
                                                        >
                                                            {SUBSCRIPTION_LABELS[company.subscription_status]}
                                                        </Badge>
                                                    ) : "-"}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                                                    {formatDate(company.last_payment_at)}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 hover:text-primary">
                                                            <Link href={`/dashboard/admin/sirketler/${company.id}`}><Eye className="size-4" /></Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 hover:text-primary">
                                                            <Link href={`/dashboard/admin/sirketler/${company.id}/duzenle`}><Pencil className="size-4" /></Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {expandedCompanyId === company.id && (
                                                <TableRow className="border-border bg-muted/20 hover:bg-muted/20">
                                                    <TableCell colSpan={9} className="px-4 py-4">
                                                        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
                                                            {company.description && (
                                                                <div>
                                                                    <span className="font-medium text-muted-foreground">Açıklama</span>
                                                                    <p className="mt-0.5 line-clamp-3">{company.description}</p>
                                                                </div>
                                                            )}
                                                            {company.website && (
                                                                <div>
                                                                    <span className="font-medium text-muted-foreground">Website</span>
                                                                    <p className="mt-0.5">
                                                                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block">
                                                                            {company.website}
                                                                        </a>
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {company.contact_email && (
                                                                <div>
                                                                    <span className="font-medium text-muted-foreground">İletişim E-posta</span>
                                                                    <p className="mt-0.5">{company.contact_email}</p>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <span className="font-medium text-muted-foreground">Çalışan sayısı (kayıtlı)</span>
                                                                <p className="mt-0.5">{company.employee_count || "—"}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
