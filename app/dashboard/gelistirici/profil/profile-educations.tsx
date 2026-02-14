"use client"

import { useState } from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { GraduationCap, Calendar, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { addEducation, deleteEducation } from "./actions"

interface Education {
    id: string
    school_name: string
    degree: string
    field_of_study: string
    start_date: string
    end_date?: string | null
}

interface ProfileEducationsProps {
    educations: Education[]
    isEditing: boolean
}

export function ProfileEducations({ educations, isEditing }: ProfileEducationsProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const data = {
            school_name: formData.get("school_name"),
            degree: formData.get("degree"),
            field_of_study: formData.get("field_of_study"),
            start_date: formData.get("start_date"),
            end_date: formData.get("end_date") || null,
        }

        const res = await addEducation(data)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Eğitim eklendi")
            setOpen(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Bu eğitimi silmek istediğinize emin misiniz?")) return

        const res = await deleteEducation(id)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Eğitim silindi")
        }
    }

    return (
        <div className="h-full">
            <div className="flex items-center justify-between border-b pb-2 mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <GraduationCap className="size-5 text-primary" />
                    Eğitim
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
                                <DialogTitle>Yeni Eğitim Ekle</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                                <div className="grid gap-2">
                                    <Label>Okul / Üniversite</Label>
                                    <Input name="school_name" required placeholder="Örn: İstanbul Teknik Üniversitesi" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Derece</Label>
                                    <Input name="degree" required placeholder="Örn: Lisans, Yüksek Lisans" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Bölüm</Label>
                                    <Input name="field_of_study" required placeholder="Örn: Bilgisayar Mühendisliği" />
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
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Ekleniyor..." : "Kaydet ve Ekle"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            <div className="space-y-6">
                {educations.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Henüz eğitim bilgisi eklenmemiş.</p>
                ) : (
                    <div className="space-y-6">
                        {educations.map((edu) => (
                            <div key={edu.id} className="relative group flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold text-base">{edu.school_name}</h4>
                                    <p className="text-sm text-foreground/80">{edu.field_of_study}, {edu.degree}</p>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <Calendar className="size-3" />
                                        <span>
                                            {format(new Date(edu.start_date), "yyyy", { locale: tr })} -{" "}
                                            {edu.end_date ? format(new Date(edu.end_date), "yyyy", { locale: tr }) : "Devam"}
                                        </span>
                                    </div>
                                </div>
                                {isEditing && (
                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(edu.id)}>
                                        <Trash2 className="size-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
