"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { updateProfile } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { AvatarUpload } from "./avatar-upload"
import { BackgroundUpload } from "./background-upload"
import { SkillSelector } from "./skill-selector"
import { useRouter } from "next/navigation"

const profileFormSchema = z.object({
    full_name: z.string().min(2, {
        message: "Ad soyad en az 2 karakter olmalıdır.",
    }),
    title: z.string().optional(),
    bio: z.string().max(1000, {
        message: "Biyografi en fazla 1000 karakter olabilir.",
    }).optional(),
    phone: z.string().optional(),
    website: z.string().url({ message: "Geçerli bir URL giriniz." }).optional().or(z.literal("")),
    social_linkedin: z.string().optional(),
    social_github: z.string().optional(),
    social_twitter: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
    initialData: {
        avatar_url?: string | null
        profile_bg_url?: string | null
        full_name: string
        title?: string | null
        bio?: string | null
        phone?: string | null
        website?: string | null
        social_links?: any
    }
    initialSkills: any[]
    userId: string
}

export function ProfileForm({ initialData, initialSkills, userId }: ProfileFormProps) {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            full_name: initialData.full_name || "",
            title: initialData.title || "",
            bio: initialData.bio || "",
            phone: initialData.phone || "",
            website: initialData.website || "",
            social_linkedin: initialData.social_links?.linkedin || "",
            social_github: initialData.social_links?.github || "",
            social_twitter: initialData.social_links?.twitter || "",
        },
    })

    async function onSubmit(data: ProfileFormValues) {
        setIsPending(true)

        try {
            const formData = new FormData()
            formData.append("full_name", data.full_name)
            if (data.title) formData.append("title", data.title)
            if (data.bio) formData.append("bio", data.bio)
            if (data.phone) formData.append("phone", data.phone)
            if (data.website) formData.append("website", data.website)

            // Socials
            if (data.social_linkedin) formData.append("social_linkedin", data.social_linkedin)
            if (data.social_github) formData.append("social_github", data.social_github)
            if (data.social_twitter) formData.append("social_twitter", data.social_twitter)

            const result = await updateProfile(null, formData)

            if (result.status === "success") {
                toast.success(result.message)
                router.push("/dashboard/gelistirici/profil")
                router.refresh()
            } else {
                toast.error(result.message || "Bir hata oluştu")
            }
        } catch (error) {
            toast.error("Beklenmedik bir hata oluştu")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* Kapak Fotoğrafı */}
            <Card>
                <CardHeader>
                    <CardTitle>Kapak Fotoğrafı</CardTitle>
                    <CardDescription>Profilinizin üst kısmında görünecek görsel</CardDescription>
                </CardHeader>
                <CardContent>
                    <BackgroundUpload
                        userId={userId}
                        currentUrl={initialData.profile_bg_url}
                        onUploadComplete={() => router.refresh()}
                    />
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sol Sütun: Avatar ve Yetenekler */}
                <div className="space-y-6">
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle>Profil Fotoğrafı</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AvatarUpload
                                userId={userId}
                                fullName={initialData.full_name}
                                currentUrl={initialData.avatar_url}
                                onUploadComplete={(url) => router.refresh()}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Yetenekler</CardTitle>
                            <CardDescription>Yeteneklerinizi ekleyin veya çıkarın</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SkillSelector userId={userId} initialSkills={initialSkills} />
                        </CardContent>
                    </Card>
                </div>

                {/* Sağ Sütun: Temel Bilgiler Formu */}
                <div className="lg:col-span-2">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {/* Kişisel Bilgiler */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Genel Bilgiler</CardTitle>
                                    <CardDescription>
                                        CV'nizde görünecek temel bilgiler
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="full_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ad Soyad</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Adınız Soyadınız" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unvan</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Örn: Senior Frontend Developer" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Biyografi (Özet)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Kendinizden, deneyimlerinizden ve hedeflerinizden kısaca bahsedin..."
                                                        className="resize-none h-32"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Kısa bir paragraflık profesyonel özet.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Telefon</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+90 555 ..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="website"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Web Sitesi / Portfolyo</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sosyal Medya */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sosyal Medya</CardTitle>
                                    <CardDescription>
                                        Bağlantılarınızı ekleyin
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="social_linkedin"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>LinkedIn</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Profil linki" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="social_github"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>GitHub</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Profil linki" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="social_twitter"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Twitter / X</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Profil linki" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end pt-6 gap-2">
                                    <Button type="button" variant="outline" onClick={() => router.push("/dashboard/gelistirici/profil")}>
                                        İptal
                                    </Button>
                                    <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                                        {isPending ? (
                                            <>
                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                                Kaydediliyor...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 size-4" />
                                                Değişiklikleri Kaydet
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}
