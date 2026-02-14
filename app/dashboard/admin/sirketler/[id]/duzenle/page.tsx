"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { CompanyPlan } from "@/lib/types"

export default function AdminEditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: companyId } = use(params)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        industry: "",
        website: "",
        location: "",
        employee_count: "",
        plan: "free" as CompanyPlan,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
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
            } else if (data) {
                setFormData({
                    name: data.name || "",
                    description: data.description || "",
                    industry: data.industry || "",
                    website: data.website || "",
                    location: data.location || "",
                    employee_count: data.employee_count || "",
                    plan: (data.plan as CompanyPlan) || "free",
                })
            }
            setLoading(false)
        }

        fetchCompany()
    }, [companyId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        try {
            const supabase = createClient()
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) throw new Error("Kullanıcı bulunamadı")

            const { error: dbError } = await supabase
                .from("companies")
                .update({
                    name: formData.name,
                    description: formData.description || null,
                    industry: formData.industry || null,
                    website: formData.website || null,
                    location: formData.location || null,
                    employee_count: formData.employee_count || null,
                    plan: formData.plan,
                })
                .eq("id", companyId)

            if (dbError) throw dbError

            router.push("/dashboard/admin/sirketler")
            router.refresh()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Şirket güncellenirken bir hata oluştu")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl min-h-screen">
            <div className="mb-6">
                <Link href="/dashboard/admin/sirketler" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <ArrowLeft className="size-4" />
                    Şirketlere Dön
                </Link>
            </div>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-2xl">Şirketi Düzenle</CardTitle>
                    <CardDescription>Şirket bilgilerini güncelleyin</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Şirket Adı <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Örn: Acme Technology"
                                className="dark:bg-input/50 dark:border-input"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="plan">Plan</Label>
                            <Select
                                value={formData.plan}
                                onValueChange={(value) => setFormData({ ...formData, plan: value as CompanyPlan })}
                            >
                                <SelectTrigger id="plan" className="dark:bg-input/50 dark:border-input">
                                    <SelectValue placeholder="Plan seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">Free</SelectItem>
                                    <SelectItem value="orta">Orta</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="industry">Sektör</Label>
                                <Input
                                    id="industry"
                                    value={formData.industry}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    placeholder="Örn: Yazılım, Finans"
                                    className="dark:bg-input/50 dark:border-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Konum</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Örn: İstanbul, Türkiye"
                                    className="dark:bg-input/50 dark:border-input"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://ornek.com"
                                    className="dark:bg-input/50 dark:border-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="employee_count">Çalışan Sayısı</Label>
                                <Input
                                    id="employee_count"
                                    value={formData.employee_count}
                                    onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                                    placeholder="Örn: 50-100"
                                    className="dark:bg-input/50 dark:border-input"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Açıklama</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Şirket hakkında kısa bir açıklama..."
                                rows={4}
                                className="dark:bg-input/50 dark:border-input"
                            />
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                                <AlertCircle className="size-5 shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button type="submit" disabled={saving} className="flex-1">
                                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/dashboard/admin/sirketler">İptal</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
