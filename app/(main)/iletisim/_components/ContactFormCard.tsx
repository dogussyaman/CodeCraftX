"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Send, CheckCircle2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { contactFormSchema, type ContactFormValues } from "@/lib/validations"
import { useState } from "react"

export function ContactFormCard() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("contact_messages").insert({
        name: data.ad,
        email: data.email,
        subject: data.konu,
        message: data.mesaj,
      })
      if (error) throw error
      toast.success("Mesajınız başarıyla gönderildi!", {
        description: "En kısa sürede size dönüş yapacağız.",
        icon: <CheckCircle2 className="h-5 w-5" />,
      })
      reset()
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      console.error("Contact form error:", err)
      let errorMessage = "Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      if (err?.code === "23505") errorMessage = "Bu mesaj zaten gönderilmiş. Lütfen farklı bir mesaj yazın."
      else if (err?.message?.includes("network") || err?.message?.includes("fetch")) errorMessage = "İnternet bağlantınızı kontrol edin ve tekrar deneyin."
      toast.error("Hata", { description: errorMessage, icon: <AlertCircle className="h-5 w-5" /> })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>Mesaj Gönderin</CardTitle>
        <CardDescription>Formu doldurun, size en kısa sürede dönüş yapalım</CardDescription>
      </CardHeader>
      <CardContent className="pb-4 pt-0">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ad">Ad Soyad <span className="text-destructive">*</span></Label>
            <Input id="ad" {...register("ad")} placeholder="Adınız ve soyadınız" className={errors.ad ? "border-destructive" : ""} />
            {errors.ad && <p className="text-sm text-destructive">{errors.ad.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-posta <span className="text-destructive">*</span></Label>
            <Input id="email" type="email" {...register("email")} placeholder="email@example.com" className={errors.email ? "border-destructive" : ""} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="konu">Konu <span className="text-destructive">*</span></Label>
            <Select onValueChange={(value) => setValue("konu", value)}>
              <SelectTrigger className={errors.konu ? "border-destructive" : ""}>
                <SelectValue placeholder="Bir konu seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="genel">Genel Bilgi</SelectItem>
                <SelectItem value="ik-surecleri">İK Süreçleri ve Kurumsal</SelectItem>
                <SelectItem value="teknik">Teknik Destek</SelectItem>
                <SelectItem value="is-birligi">İş Birliği</SelectItem>
                <SelectItem value="satis">Satış ve Fiyatlandırma</SelectItem>
                <SelectItem value="sikayet">Şikayet ve Öneri</SelectItem>
                <SelectItem value="diger">Diğer</SelectItem>
              </SelectContent>
            </Select>
            {errors.konu && <p className="text-sm text-destructive">{errors.konu.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mesaj">Mesaj <span className="text-destructive">*</span></Label>
            <Textarea id="mesaj" {...register("mesaj")} placeholder="Mesajınızı buraya yazın..." rows={4} className={errors.mesaj ? "border-destructive" : ""} />
            {errors.mesaj && <p className="text-sm text-destructive">{errors.mesaj.message}</p>}
          </div>
          <Button type="submit" className="w-full text-base font-semibold" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="size-4 mr-2" />
                Gönder
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
