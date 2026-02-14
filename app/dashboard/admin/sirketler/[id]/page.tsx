"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Globe, MapPin, Users, Briefcase, Loader2, Pencil, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Company } from "@/lib/types"

export default function AdminCompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: companyId } = use(params)
    const [company, setCompany] = useState<Company | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchCompany = async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from("companies")
                .select("*")
                .eq("id", companyId)
                .single()

            if (error) {
                console.error("Error fetching company:", error)
                setError("Şirket bilgileri yüklenemedi.")
            } else {
                setCompany(data)
            }
            setLoading(false)
        }

        fetchCompany()
    }, [companyId])

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
        )
    }

    if (error || !company) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <Building2 className="size-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">{error || "Şirket bulunamadı"}</p>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard/admin/sirketler">
                            <ArrowLeft className="size-4 mr-2" />
                            Şirketlere Dön
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl min-h-screen">
            <div className="mb-6 flex items-center justify-between">
                <Link href="/dashboard/admin/sirketler" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <ArrowLeft className="size-4" />
                    Şirketlere Dön
                </Link>
                <Button asChild>
                    <Link href={`/dashboard/admin/sirketler/${companyId}/duzenle`}>
                        <Pencil className="size-4 mr-2" />
                        Düzenle
                    </Link>
                </Button>
            </div>

            <Card className="bg-card border-border">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-16 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="size-8 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">{company.name}</CardTitle>
                                <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                                    <Badge variant="success">
                                        Aktif
                                    </Badge>
                                    {company.plan && (
                                        <Badge variant="secondary">
                                            {company.plan === "free" && "Free"}
                                            {company.plan === "orta" && "Orta"}
                                            {company.plan === "premium" && "Premium"}
                                        </Badge>
                                    )}
                                </CardDescription>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Description */}
                    {company.description && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Açıklama</h3>
                            <p className="text-foreground">{company.description}</p>
                        </div>
                    )}

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {company.industry && (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 dark:bg-zinc-800/50">
                                <Briefcase className="size-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Sektör</p>
                                    <p className="font-medium">{company.industry}</p>
                                </div>
                            </div>
                        )}

                        {company.location && (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 dark:bg-zinc-800/50">
                                <MapPin className="size-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Konum</p>
                                    <p className="font-medium">{company.location}</p>
                                </div>
                            </div>
                        )}

                        {company.employee_count && (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 dark:bg-zinc-800/50">
                                <Users className="size-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Çalışan Sayısı</p>
                                    <p className="font-medium">{company.employee_count}</p>
                                </div>
                            </div>
                        )}

                        {company.website && (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 dark:bg-zinc-800/50">
                                <Globe className="size-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Website</p>
                                    <a
                                        href={company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-primary hover:underline"
                                    >
                                        {company.website}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timestamps */}
                    <div className="pt-4 border-t border-border">
                        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                            {company.created_at && (
                                <div>
                                    <span>Oluşturulma: </span>
                                    <span className="text-foreground">
                                        {new Date(company.created_at).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
