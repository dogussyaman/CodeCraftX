"use client"

import { useState } from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Briefcase, Calendar, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { addExperience, deleteExperience } from "./actions"

interface Experience {
    id: string
    company_name: string
    position: string
    start_date: string
    end_date?: string | null
    description?: string | null
}

interface ProfileExperiencesProps {
    experiences: Experience[]
    isEditing: boolean
}

export function ProfileExperiences({ experiences, isEditing }: ProfileExperiencesProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        // Checkbox değeri "on" veya null gelir, bunu kontrol edelim
        const isCurrent = formData.get("is_current") === "on"

        const data = {
            company_name: formData.get("company_name"),
            position: formData.get("position"),
            start_date: formData.get("start_date"),
            end_date: isCurrent ? null : formData.get("end_date"),
            description: formData.get("description"),
        }

        const res = await addExperience(data)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Deneyim eklendi")
            setOpen(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Bu deneyimi silmek istediğinize emin misiniz?")) return

        const res = await deleteExperience(id)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Deneyim silindi")
        }
    }

    return (
        <div className="h-full">
            <div className="flex items-center justify-between border-b pb-2 mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Briefcase className="size-5 text-primary" />
                    Deneyimler
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
                                <DialogTitle>Yeni Deneyim Ekle</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="grid gap-2">
                                    <Label>Şirket Adı</Label>
                                    <Input name="company_name" required placeholder="Örn: CodeCraftX" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Pozisyon</Label>
                                    <Input name="position" required placeholder="Örn: Frontend Developer" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Başlangıç Tarihi</Label>
                                        <Input type="date" name="start_date" required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Bitiş Tarihi</Label>
                                        <Input type="date" name="end_date" />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="is_current" name="is_current" />
                                    <Label htmlFor="is_current">Halen burada çalışıyorum</Label>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Açıklama</Label>
                                    <Textarea name="description" placeholder="Görevlerinizden bahsedin..." />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Ekleniyor..." : "Kaydet ve Ekle"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            <div className="space-y-6">
                {experiences.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Henüz deneyim eklenmemiş.</p>
                ) : (
                    <div className="relative border-l border-muted ml-2 space-y-6">
                        {experiences.map((exp) => (
                            <div key={exp.id} className="ml-6 relative group">
                                <span className="absolute -left-[31px] top-1 flex size-4 items-center justify-center rounded-full bg-primary ring-4 ring-card" />
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-base">{exp.position}</h4>
                                        <p className="text-sm font-medium text-foreground/80">{exp.company_name}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                            <Calendar className="size-3" />
                                            <span>
                                                {format(new Date(exp.start_date), "MMM yyyy", { locale: tr })} -{" "}
                                                {exp.end_date ? format(new Date(exp.end_date), "MMM yyyy", { locale: tr }) : "Devam Ediyor"}
                                            </span>
                                        </div>
                                        {exp.description && (
                                            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(exp.id)}>
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
