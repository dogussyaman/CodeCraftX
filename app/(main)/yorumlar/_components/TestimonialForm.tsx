"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, MessageSquarePlus } from "lucide-react"
import { createTestimonial, type TestimonialFormState } from "../actions"
import { toast } from "sonner"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="gap-2">
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Gönderiliyor..." : "Yorum Gönder"}
    </Button>
  )
}

export function TestimonialForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(createTestimonial, { ok: false })

  useEffect(() => {
    if (state.ok) {
      toast.success("Yorumunuz eklendi")
      const form = document.getElementById("testimonial-form") as HTMLFormElement
      form?.reset()
      router.refresh()
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquarePlus className="size-5" />
          Yorum Bırak
        </CardTitle>
        <CardDescription>
          CodeCraftX hakkındaki deneyimlerinizi paylaşın. Giriş yapmış olmanız gerekiyor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="testimonial-form" action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testimonial-body">Yorumunuz *</Label>
            <Textarea
              id="testimonial-body"
              name="body"
              placeholder="Platform deneyiminizi kısaca yazın..."
              rows={4}
              required
              maxLength={2000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">En az 10, en fazla 2000 karakter.</p>
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
