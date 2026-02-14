"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { changePassword } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Lock, Eye, EyeOff } from "lucide-react"
import { changePasswordSchema, type ChangePasswordFormValues } from "@/lib/validations"

export function ChangePasswordForm() {
    const [isPending, setIsPending] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showRepeatPassword, setShowRepeatPassword] = useState(false)

    const form = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            repeatPassword: "",
        },
    })

    async function onSubmit(data: ChangePasswordFormValues) {
        setIsPending(true)

        try {
            const formData = new FormData()
            formData.append("currentPassword", data.currentPassword)
            formData.append("newPassword", data.newPassword)
            formData.append("repeatPassword", data.repeatPassword)

            const result = await changePassword(null, formData)

            if (result.status === "success") {
                toast.success(result.message)
                form.reset()
            } else {
                toast.error(result.message || "Şifre güncellenirken bir hata oluştu")
            }
        } catch (error) {
            console.error("Password change error:", error)
            toast.error("Şifre güncellenirken bir hata oluştu")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lock className="size-5" />
                    Şifre Değiştir
                </CardTitle>
                <CardDescription>
                    Hesabınızın güvenliği için güçlü bir şifre kullanın
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mevcut Şifre</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showCurrentPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                {...field}
                                                className="pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="size-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="size-4 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Yeni Şifre</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showNewPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                {...field}
                                                className="pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="size-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="size-4 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        En az 8 karakter, büyük harf, küçük harf ve sayı içermelidir
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="repeatPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Yeni Şifre Tekrar</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showRepeatPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                {...field}
                                                className="pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                                            >
                                                {showRepeatPassword ? (
                                                    <EyeOff className="size-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="size-4 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isPending} className="w-full">
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    Güncelleniyor...
                                </>
                            ) : (
                                "Şifreyi Güncelle"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
