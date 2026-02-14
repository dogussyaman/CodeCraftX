import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type CreateCompanyRequest = {
  companyName: string
  description?: string
  industry?: string
  website?: string
  location?: string
  employeeCount?: string
  legalTitle?: string
  taxNumber?: string
  taxOffice?: string
  address?: string
  phone?: string
  contactEmail?: string
  plan?: "free" | "orta" | "premium"
  billingPeriod?: "monthly" | "annually"
  ownerFullName: string
  ownerEmail: string
  tempPassword?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateCompanyRequest

    if (!body.companyName || !body.ownerEmail || !body.ownerFullName) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik: şirket adı, sahibi adı, sahibi e-posta" },
        { status: 400 },
      )
    }

    const supabase = await createServerClient()

    // Giriş yapan kullanıcının admin olduğunu doğrula
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single()

    if (profileError || !profile || !["admin", "platform_admin", "mt"].includes(profile.role)) {
      return NextResponse.json({ error: "Sadece admin veya MT kullanıcılar şirket oluşturabilir" }, { status: 403 })
    }

    // Service-role client ile auth user oluştur
    const adminClient = createAdminClient()
    const tempPassword =
      body.tempPassword ||
      Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase()

    const {
      data: createdUser,
      error: createUserError,
    } = await adminClient.auth.admin.createUser({
      email: body.ownerEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: body.ownerFullName,
        role: "company_admin",
      },
    })

    if (createUserError || !createdUser?.user) {
      console.error("Admin createUser error:", createUserError)
      return NextResponse.json(
        { error: createUserError?.message || "Şirket sahibi kullanıcısı oluşturulamadı" },
        { status: 500 },
      )
    }

    const ownerUserId = createdUser.user.id

    const planValue =
      body.plan === "orta" || body.plan === "premium" ? body.plan : "free"

    // create_company_with_owner RPC çağrısı
    const { data: rpcResult, error: rpcError } = await supabase.rpc("create_company_with_owner", {
      company_name: body.companyName,
      company_email: body.contactEmail || body.ownerEmail,
      owner_full_name: body.ownerFullName,
      owner_user_id: ownerUserId,
      temp_password: tempPassword,
      created_by_admin_id: currentUser.id,
      company_description: body.description || null,
      company_industry: body.industry || null,
      company_website: body.website || null,
      company_location: body.location || null,
      company_employee_count: body.employeeCount || null,
      company_legal_title: body.legalTitle || null,
      company_tax_number: body.taxNumber || null,
      company_tax_office: body.taxOffice || null,
      company_address: body.address || null,
      company_phone: body.phone || null,
      company_contact_email: body.contactEmail || body.ownerEmail,
      p_plan: planValue,
    })

    if (rpcError) {
      console.error("create_company_with_owner error:", rpcError)
      return NextResponse.json(
        { error: rpcError.message || "Şirket oluşturma fonksiyonu başarısız oldu" },
        { status: 500 },
      )
    }

    const newCompanyId = rpcResult?.company_id
    const billingPeriod = body.billingPeriod === "annually" ? "annually" : "monthly"
    if (newCompanyId) {
      await supabase
        .from("companies")
        .update({ billing_period: billingPeriod })
        .eq("id", newCompanyId)
    }

    return NextResponse.json({
      success: true,
      companyId: rpcResult?.company_id,
      ownerUserId,
      tempPassword,
    })
  } catch (error: any) {
    console.error("Unexpected error in create-company route:", error)
    return NextResponse.json(
      { error: error?.message || "Beklenmeyen bir hata oluştu" },
      { status: 500 },
    )
  }
}

