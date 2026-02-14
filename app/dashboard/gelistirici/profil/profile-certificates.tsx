"use client"

import { useState } from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Award, ExternalLink, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { addCertificate, deleteCertificate } from "./actions"

interface Certificate {
    id: string
    name: string
    issuer: string
    issue_date: string
    url?: string | null
}

interface ProfileCertificatesProps {
    certificates: Certificate[]
    isEditing: boolean
}

export function ProfileCertificates({ certificates, isEditing }: ProfileCertificatesProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const data = {
            name: formData.get("name"),
            issuer: formData.get("issuer"),
            issue_date: formData.get("issue_date"),
            url: formData.get("url") || null,
        }

        const res = await addCertificate(data)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Sertifika eklendi")
            setOpen(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Bu sertifikayı silmek istediğinize emin misiniz?")) return

        const res = await deleteCertificate(id)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Sertifika silindi")
        }
    }

    return (
        <div className="h-full">
            <div className="flex items-center justify-between border-b pb-2 mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Award className="size-5 text-primary" />
                    Sertifikalar
                </h3>
                {isEditing && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8">
                                <Plus className="mr-2 size-4" /> Ekle
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Yeni Sertifika Ekle</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="grid gap-2">
                                    <Label>Sertifika Adı</Label>
                                    <Input name="name" required placeholder="Örn: AWS Certified Solutions Architect" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Veren Kurum</Label>
                                    <Input name="issuer" required placeholder="Örn: Amazon Web Services" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Alınma Tarihi</Label>
                                    <Input type="date" name="issue_date" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Sertifika Linki (Opsiyonel)</Label>
                                    <Input name="url" type="url" placeholder="https://..." />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Ekleniyor..." : "Kaydet ve Ekle"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            <div className="space-y-4">
                {certificates.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Henüz sertifika eklenmemiş.</p>
                ) : (
                    <div className="grid gap-4">
                        {certificates.map((cert) => (
                            <div key={cert.id} className="relative group border rounded-lg p-3 flex justify-between items-center hover:bg-muted/50 transition-colors">
                                <div>
                                    <h4 className="font-semibold text-sm">{cert.name}</h4>
                                    <p className="text-xs text-muted-foreground">{cert.issuer} • {format(new Date(cert.issue_date), "MMM yyyy", { locale: tr })}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {cert.url && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                            <a href={cert.url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="size-4" />
                                            </a>
                                        </Button>
                                    )}
                                    {isEditing && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(cert.id)}>
                                            <Trash2 className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
