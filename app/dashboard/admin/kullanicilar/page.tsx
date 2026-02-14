"use client"

import { Fragment, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Mail, Calendar, Shield, ChevronRight, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ROLE_BADGE_MAP } from "@/lib/status-variants"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
  updated_at?: string
}

const ROLE_FILTER_OPTIONS = [
  { value: "all", label: "Tümü" },
  { value: "developer", label: "Geliştirici" },
  { value: "hr", label: "İK Uzmanı" },
  { value: "admin", label: "Yönetici" },
  { value: "company_admin", label: "Şirket Sahibi" },
] as const

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at, updated_at")
      .order("created_at", { ascending: false })
    if (data) setUsers(data as Profile[])
    setIsLoading(false)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)
      if (error) throw error
      toast({ title: "Başarılı", description: "Kullanıcı rolü başarıyla güncellendi.", variant: "default" })
      fetchUsers()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kullanıcı rolü güncellenirken bir sorun oluştu.",
        variant: "destructive",
      })
      console.error(error)
    }
  }

  const getRoleBadge = (role: string) => {
    const config = ROLE_BADGE_MAP[role] || { label: role, variant: "outline" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getInitials = (name: string) => {
    if (!name) return "??"
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const COLUMN_COUNT = 5

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Mail className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kullanıcı Yönetimi</h1>
            <p className="text-sm text-muted-foreground">Tüm platform kullanıcıları ve rol yönetimi</p>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border border-border bg-card shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Tüm Kullanıcılar</CardTitle>
              <CardDescription>{filteredUsers.length} kullanıcı</CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-[200px]"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-b-2xl overflow-hidden border-t border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-10 px-4 py-3"> </TableHead>
                  <TableHead className="px-4 py-3">Ad Soyad</TableHead>
                  <TableHead className="px-4 py-3">E-posta</TableHead>
                  <TableHead className="px-4 py-3">Rol</TableHead>
                  <TableHead className="px-4 py-3">Kayıt</TableHead>
                  <TableHead className="px-4 py-3 text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="border-border">
                      {Array.from({ length: COLUMN_COUNT + 1 }).map((_, j) => (
                        <TableCell key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={COLUMN_COUNT + 1} className="h-24 text-center text-muted-foreground">
                      {searchQuery || roleFilter !== "all" ? "Arama kriterlerine uygun kullanıcı yok" : "Henüz kullanıcı yok"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <Fragment key={user.id}>
                      <TableRow
                        className={cn(
                          "border-border cursor-pointer transition-colors",
                          expandedUserId === user.id && "bg-muted/30"
                        )}
                        onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                      >
                        <TableCell className="w-10 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="flex items-center justify-center rounded p-1 hover:bg-muted"
                            onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                            aria-label={expandedUserId === user.id ? "Detayı kapat" : "Detayı aç"}
                          >
                            <ChevronRight
                              className={cn("size-4 text-muted-foreground transition-transform", expandedUserId === user.id && "rotate-90")}
                            />
                          </button>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9 shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(user.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.full_name || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground">{user.email || "—"}</TableCell>
                        <TableCell className="px-4 py-3">{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                          >
                            <SelectTrigger className="w-[140px] ml-auto border-0 bg-transparent shadow-none hover:bg-muted/50">
                              <Shield className="size-4 text-muted-foreground mr-1" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="developer">Geliştirici</SelectItem>
                              <SelectItem value="hr">İK Uzmanı</SelectItem>
                              <SelectItem value="admin">Yönetici</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                      {expandedUserId === user.id && (
                        <TableRow className="border-border bg-muted/20 hover:bg-muted/20">
                          <TableCell colSpan={COLUMN_COUNT + 1} className="px-4 py-4">
                            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 md:grid-cols-4">
                              <div>
                                <span className="font-medium text-muted-foreground">Kullanıcı ID</span>
                                <p className="mt-0.5 font-mono text-xs break-all">{user.id}</p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Oluşturulma</span>
                                <p className="mt-0.5">{formatDate(user.created_at)}</p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Son güncelleme</span>
                                <p className="mt-0.5">{user.updated_at ? formatDate(user.updated_at) : "—"}</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
