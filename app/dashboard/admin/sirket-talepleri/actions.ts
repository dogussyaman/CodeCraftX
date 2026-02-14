"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { sendCompanyApprovedEmailUsecase } from "@/lib/email/usecases"

export type CompanyRequestStatus = "approved" | "rejected"

export async function updateCompanyRequestStatus(
  requestId: string,
  status: CompanyRequestStatus
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Oturum gerekli" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const role = profile?.role
  if (role !== "admin" && role !== "platform_admin" && role !== "mt") {
    return { ok: false, error: "Yetkiniz yok" }
  }

  const { data: existing, error: fetchErr } = await supabase
    .from("company_requests")
    .select("id, status, user_id, company_name")
    .eq("id", requestId)
    .single()

  if (fetchErr || !existing) {
    return { ok: false, error: "Talep bulunamadı" }
  }
  if (existing.status !== "pending") {
    return { ok: false, error: "Talep zaten değerlendirilmiş" }
  }

  const { error: updateErr } = await supabase
    .from("company_requests")
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)

  if (updateErr) {
    return { ok: false, error: updateErr.message }
  }

  // Onaylanan talepler için işverene bilgilendirme emaili gönder
  if (status === "approved" && existing.user_id) {
    const { data: requesterProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", existing.user_id)
      .maybeSingle()

    const toEmail = requesterProfile?.email
    if (toEmail) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.codecraftx.xyz"
      await sendCompanyApprovedEmailUsecase(toEmail, {
        companyName: existing.company_name,
        contactName: requesterProfile?.full_name || toEmail,
        dashboardUrl: `${siteUrl}/dashboard/company`,
      })
    }
  }

  revalidatePath("/dashboard/admin/sirket-talepleri")
  return { ok: true }
}
