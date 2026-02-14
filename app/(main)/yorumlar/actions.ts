"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const testimonialSchema = z.object({
  body: z.string().min(10, "Yorum en az 10 karakter olmalıdır").max(2000, "Yorum en fazla 2000 karakter olabilir"),
})

export type TestimonialFormState = { ok: boolean; error?: string }

export async function createTestimonial(
  prev: TestimonialFormState,
  formData: FormData
): Promise<TestimonialFormState> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Yorum yapmak için giriş yapmalısınız" }

  const body = (formData.get("body") as string)?.trim()
  const parsed = testimonialSchema.safeParse({ body })
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? "Veri doğrulama hatası"
    return { ok: false, error: msg }
  }

  const { error } = await supabase.from("testimonials").insert({
    user_id: user.id,
    body: parsed.data.body,
    status: "published",
  })

  if (error) {
    console.error("Testimonial create error:", error)
    return { ok: false, error: "Yorum gönderilemedi" }
  }

  revalidatePath("/yorumlar")
  return { ok: true }
}
