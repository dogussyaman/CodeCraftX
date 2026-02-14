"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, FileText, AlertCircle, Loader2, Star, StarOff } from "lucide-react"
import type { CoverLetter } from "@/lib/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CoverLetterListProps {
    initialCoverLetters: CoverLetter[]
    userId: string
}

export function CoverLetterList({ initialCoverLetters, userId }: CoverLetterListProps) {
    const [coverLetters, setCoverLetters] = useState<CoverLetter[]>(initialCoverLetters)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [currentLetter, setCurrentLetter] = useState<CoverLetter | null>(null)
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState<"all" | "favorites">("all")

    // Form states
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")

    const router = useRouter()
    const supabase = createClient()

    const resetForm = () => {
        setTitle("")
        setContent("")
        setCurrentLetter(null)
    }

    const handleAdd = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error("Lütfen başlık ve içerik alanlarını doldurun.")
            return
        }

        if (coverLetters.length >= 5) {
            toast.error("En fazla 5 adet ön yazı şablonu oluşturabilirsiniz.")
            return
        }

        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("cover_letters")
                .insert({
                    developer_id: userId,
                    title,
                    content,
                })
                .select()
                .single()

            if (error) throw error

            setCoverLetters([data, ...coverLetters])
            toast.success("Ön yazı şablonu başarıyla oluşturuldu.")
            setIsAddOpen(false)
            resetForm()
            router.refresh()
        } catch (error) {
            console.error("Error adding cover letter:", error)
            toast.error("Ön yazı eklenirken bir hata oluştu.")
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = async () => {
        if (!currentLetter || !title.trim() || !content.trim()) return

        try {
            setLoading(true)
            const { data, error } = await supabase
                .from("cover_letters")
                .update({
                    title,
                    content,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", currentLetter.id)
                .select()
                .single()

            if (error) throw error

            setCoverLetters(coverLetters.map((cl) => (cl.id === currentLetter.id ? data : cl)))
            toast.success("Ön yazı şablonu güncellendi.")
            setIsEditOpen(false)
            resetForm()
            router.refresh()
        } catch (error) {
            console.error("Error updating cover letter:", error)
            toast.error("Güncelleme sırasında bir hata oluştu.")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!currentLetter) return

        try {
            setLoading(true)
            const { error } = await supabase.from("cover_letters").delete().eq("id", currentLetter.id)

            if (error) throw error

            setCoverLetters(coverLetters.filter((cl) => cl.id !== currentLetter.id))
            toast.success("Ön yazı şablonu silindi.")
            setIsDeleteOpen(false)
            setCurrentLetter(null)
            router.refresh()
        } catch (error) {
            console.error("Error deleting cover letter:", error)
            toast.error("Silme işlemi sırasında bir hata oluştu.")
        } finally {
            setLoading(false)
        }
    }

    const openEditModal = (letter: CoverLetter) => {
        setCurrentLetter(letter)
        setTitle(letter.title)
        setContent(letter.content)
        setIsEditOpen(true)
    }

    const openDeleteModal = (letter: CoverLetter) => {
        setCurrentLetter(letter)
        setIsDeleteOpen(true)
    }

    const toggleFavorite = async (letter: CoverLetter) => {
        try {
            const newFavoriteStatus = !letter.is_favorite
            const { data, error } = await supabase
                .from("cover_letters")
                .update({ is_favorite: newFavoriteStatus })
                .eq("id", letter.id)
                .select()
                .single()

            if (error) throw error

            setCoverLetters(coverLetters.map((cl) => (cl.id === letter.id ? data : cl)))
            toast.success(newFavoriteStatus ? "Favorilere eklendi" : "Favorilerden çıkarıldı")
            router.refresh()
        } catch (error) {
            console.error("Error toggling favorite:", error)
            toast.error("Favori durumu güncellenirken bir hata oluştu")
        }
    }

    const filteredCoverLetters = filter === "favorites" 
        ? coverLetters.filter((cl) => cl.is_favorite)
        : coverLetters

    const favoriteCount = coverLetters.filter((cl) => cl.is_favorite).length

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ön Yazı Şablonlarım</h1>
                    <p className="text-muted-foreground mt-1">
                        İş başvurularında kullanmak üzere hazır şablonlar oluşturun. ({coverLetters.length}/5)
                    </p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} disabled={coverLetters.length >= 5} className="gap-2">
                    <Plus className="size-4" />
                    Yeni Şablon
                </Button>
            </div>

            {coverLetters.length > 0 && (
                <Tabs value={filter} onValueChange={(value) => setFilter(value as "all" | "favorites")}>
                    <TabsList>
                        <TabsTrigger value="all">Tümü ({coverLetters.length})</TabsTrigger>
                        <TabsTrigger value="favorites">
                            Favoriler ({favoriteCount})
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            )}

            {filteredCoverLetters.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/30 text-center animate-in fade-in-50">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <FileText className="size-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Henüz şablonunuz yok</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                        Başvurularınızı hızlandırmak için hemen bir ön yazı şablonu oluşturun. En fazla 5 adet şablon saklayabilirsiniz.
                    </p>
                    <Button onClick={() => setIsAddOpen(true)}>Şablon Oluştur</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCoverLetters.map((letter) => (
                        <Card key={letter.id} className={`group flex flex-col relative overflow-hidden transition-all hover:shadow-lg border bg-card hover:bg-accent/5 ${letter.is_favorite ? "ring-2 ring-primary/50" : ""}`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="flex items-center gap-2 text-lg flex-1">
                                        <div className="p-2 bg-primary/10 rounded-md shrink-0">
                                            <FileText className="size-5 text-primary" />
                                        </div>
                                        <span className="truncate" title={letter.title}>
                                            {letter.title}
                                        </span>
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 shrink-0"
                                        onClick={() => toggleFavorite(letter)}
                                    >
                                        {letter.is_favorite ? (
                                            <Star className="size-4 text-warning fill-warning" />
                                        ) : (
                                            <StarOff className="size-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                                <CardDescription className="text-xs">
                                    Son güncelleme: {new Date(letter.updated_at).toLocaleDateString("tr-TR")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
                                    {letter.content}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-2 flex justify-end gap-2 border-t bg-muted/20">
                                <Button variant="ghost" size="sm" onClick={() => openEditModal(letter)} className="hover:bg-background h-8">
                                    <Pencil className="size-3.5 mr-1.5" />
                                    Düzenle
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                                    onClick={() => openDeleteModal(letter)}
                                >
                                    <Trash2 className="size-3.5 mr-1.5" />
                                    Sil
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Ekleme Modalı */}
            <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Yeni Ön Yazı Şablonu</DialogTitle>
                        <DialogDescription>
                            Başvurularınızda kullanacağınız yeni bir şablon oluşturun.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Başlık (Örn: Kurumsal Başvuru)</Label>
                            <Input
                                id="title"
                                placeholder="Şablonunuz için hatırlatıcı bir başlık"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Ön Yazı İçeriği</Label>
                            <Textarea
                                id="content"
                                placeholder="Sayın Yetkili, firmanızda açık olan..."
                                className="min-h-[200px]"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>İptal</Button>
                        <Button onClick={handleAdd} disabled={loading}>
                            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Oluştur
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Düzenleme Modalı */}
            <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Şablonu Düzenle</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Başlık</Label>
                            <Input
                                id="edit-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-content">İçerik</Label>
                            <Textarea
                                id="edit-content"
                                className="min-h-[200px]"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>İptal</Button>
                        <Button onClick={handleEdit} disabled={loading}>
                            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Kaydet
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Silme Modalı */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Şablonu Sil</DialogTitle>
                        <DialogDescription>
                            Bu şablonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 bg-muted/50 rounded-lg p-4 mb-2">
                        <p className="font-medium">{currentLetter?.title}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>İptal</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Sil
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
