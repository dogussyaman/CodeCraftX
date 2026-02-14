"use client"

import { Fragment, useState } from "react"
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
import { Mail, Phone, Calendar, ShieldAlert, ChevronRight, Search, Globe, FileText } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"

export interface EmployeeRow {
  id: string
  full_name: string | null
  email: string | null
  role: string
  title: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at?: string | null
  must_change_password?: boolean | null
  bio?: string | null
  website?: string | null
}

const roleLabel: Record<string, string> = {
  company_admin: "Şirket Sahibi",
  hr: "İK",
  developer: "Geliştirici",
  admin: "Admin",
  platform_admin: "Platform Admin",
  mt: "MT",
}

const roleVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  company_admin: "default",
  hr: "secondary",
  developer: "outline",
  admin: "destructive",
}

interface EmployeesTableProps {
  employees: EmployeeRow[]
}

export function EmployeesTable({ employees }: EmployeesTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = employees.filter((emp) => {
    const q = searchQuery.toLowerCase()
    return (
      !q ||
      emp.full_name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.title?.toLowerCase().includes(q) ||
      (roleLabel[emp.role] ?? emp.role).toLowerCase().includes(q)
    )
  })

  const COLUMN_COUNT = 7

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Ekip listesi</CardTitle>
            <CardDescription>{filtered.length} çalışan</CardDescription>
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="rounded-b-2xl overflow-hidden border-t border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-10 px-4 py-3"> </TableHead>
                <TableHead className="px-4 py-3">Ad</TableHead>
                <TableHead className="px-4 py-3">E-posta</TableHead>
                <TableHead className="px-4 py-3">Rol</TableHead>
                <TableHead className="px-4 py-3">Pozisyon</TableHead>
                <TableHead className="px-4 py-3">Telefon</TableHead>
                <TableHead className="px-4 py-3">Katılım</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((emp) => (
                <Fragment key={emp.id}>
                  <TableRow
                    className={cn(
                      "border-border cursor-pointer transition-colors hover:bg-muted/50",
                      expandedId === emp.id && "bg-muted/30"
                    )}
                    onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)}
                  >
                    <TableCell className="w-10 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="flex items-center justify-center rounded p-1 hover:bg-muted"
                        onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)}
                        aria-label={expandedId === emp.id ? "Detayı kapat" : "Detayı aç"}
                      >
                        <ChevronRight
                          className={cn("size-4 text-muted-foreground transition-transform", expandedId === emp.id && "rotate-90")}
                        />
                      </button>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
                          {emp.avatar_url ? (
                            <img src={emp.avatar_url} alt="" className="size-full object-cover" />
                          ) : (
                            <span className="text-sm font-semibold text-muted-foreground">
                              {(emp.full_name ?? "?").slice(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{emp.full_name ?? "—"}</span>
                          {emp.must_change_password && (
                            <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-700 dark:text-amber-400">
                              <ShieldAlert className="size-3 mr-0.5" />
                              Şifre bekliyor
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                      {emp.email ? (
                        <a href={`mailto:${emp.email}`} className="hover:text-foreground hover:underline" onClick={(e) => e.stopPropagation()}>
                          {emp.email}
                        </a>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge variant={roleVariant[emp.role] ?? "outline"} className="text-xs">
                        {roleLabel[emp.role] ?? emp.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground text-sm">{emp.title || "—"}</TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground text-sm">{emp.phone || "—"}</TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                      {format(new Date(emp.created_at), "d MMM yyyy", { locale: tr })}
                    </TableCell>
                  </TableRow>
                  {expandedId === emp.id && (
                    <TableRow className="border-border bg-muted/20 hover:bg-muted/20">
                      <TableCell colSpan={COLUMN_COUNT + 1} className="px-4 py-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="flex items-start gap-3">
                            <div className="size-14 shrink-0 rounded-lg bg-muted border border-border overflow-hidden">
                              {emp.avatar_url ? (
                                <img src={emp.avatar_url} alt="" className="size-full object-cover" />
                              ) : (
                                <div className="size-full flex items-center justify-center text-muted-foreground text-xl font-semibold">
                                  {(emp.full_name ?? "?").slice(0, 1).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 space-y-1 text-sm">
                              <p><span className="font-medium text-muted-foreground">Ad Soyad:</span> {emp.full_name ?? "—"}</p>
                              <p><span className="font-medium text-muted-foreground">E-posta:</span> {emp.email ?? "—"}</p>
                              <p><span className="font-medium text-muted-foreground">Pozisyon:</span> {emp.title ?? "—"}</p>
                              <p><span className="font-medium text-muted-foreground">Telefon:</span> {emp.phone ?? "—"}</p>
                              <p><span className="font-medium text-muted-foreground">Rol:</span> {roleLabel[emp.role] ?? emp.role}</p>
                              <p><span className="font-medium text-muted-foreground">Katılım:</span> {format(new Date(emp.created_at), "d MMMM yyyy", { locale: tr })}</p>
                              {emp.updated_at && (
                                <p><span className="font-medium text-muted-foreground">Son güncelleme:</span> {format(new Date(emp.updated_at), "d MMM yyyy", { locale: tr })}</p>
                              )}
                              {emp.must_change_password && (
                                <p className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                  <ShieldAlert className="size-4" />
                                  Şifre sıfırlama bekliyor
                                </p>
                              )}
                            </div>
                          </div>
                          {emp.bio && (
                            <div className="text-sm">
                              <p className="font-medium text-muted-foreground flex items-center gap-1 mb-1">
                                <FileText className="size-4" /> Bio
                              </p>
                              <p className="text-muted-foreground line-clamp-4">{emp.bio}</p>
                            </div>
                          )}
                          {emp.website && (
                            <div className="text-sm">
                              <p className="font-medium text-muted-foreground flex items-center gap-1 mb-1">
                                <Globe className="size-4" /> Website
                              </p>
                              <a
                                href={emp.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline break-all"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {emp.website}
                              </a>
                            </div>
                          )}
                          {!emp.bio && !emp.website && (
                            <div className="text-sm text-muted-foreground">
                              Ek profil bilgisi (bio, website) eklenmemiş.
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
