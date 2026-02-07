import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type CreateHrRequest = {
  email: string
  fullName: string
  tempPassword?: string
  title?: string
  phone?: string
  bio?: string
  website?: string
  avatar_url?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateHrRequest

    if (!body.email || !body.fullName) {
      return NextResponse.json(
        { error: "Zorunlu alanlar eksik: e-posta ve ad soyad" },
        { status: 400 },
      )
    }

    const supabase = await createServerClient()

    // Oturum ve profil kontrolü
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, company_id")
      .eq("id", currentUser.id)
      .single()

    if (profileError || !profile || !profile.company_id) {
      return NextResponse.json(
        { error: "Şirket bilgisi bulunamadı. Lütfen profilinizi kontrol edin." },
        { status: 400 },
      )
    }

    if (!["company_admin", "admin", "platform_admin"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Sadece şirket sahibi veya admin İK kullanıcısı ekleyebilir" },
        { status: 403 },
      )
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
      email: body.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: body.fullName,
        role: "hr",
      },
    })

    if (createUserError || !createdUser?.user) {
      console.error("Company create HR user error:", createUserError)
      return NextResponse.json(
        { error: createUserError?.message || "İK kullanıcısı oluşturulamadı" },
        { status: 500 },
      )
    }

    const hrUserId = createdUser.user.id

    // create_hr_user RPC çağrısı
    const { data: rpcResult, error: rpcError } = await supabase.rpc("create_hr_user", {
      hr_email: body.email,
      hr_full_name: body.fullName,
      hr_user_id: hrUserId,
      temp_password: tempPassword,
      company_id_param: profile.company_id,
      created_by_user_id: currentUser.id,
      hr_title: body.title || null,
      hr_phone: body.phone || null,
      hr_bio: body.bio || null,
      hr_website: body.website || null,
      hr_avatar_url: body.avatar_url || null,
    })

    if (rpcError) {
      console.error("create_hr_user error:", rpcError)
      return NextResponse.json(
        { error: rpcError.message || "İK kullanıcısı oluşturma fonksiyonu başarısız oldu" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      hrUserId,
      rpcResult,
      tempPassword,
    })
  } catch (error: any) {
    console.error("Unexpected error in create-hr route:", error)
    return NextResponse.json(
      { error: error?.message || "Beklenmeyen bir hata oluştu" },
      { status: 500 },
    )
  }
}

