"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const profileSchema = z.object({
    full_name: z.string().min(2),
    title: z.string().optional(),
    bio: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    social_linkedin: z.string().optional(),
    social_github: z.string().optional(),
    social_twitter: z.string().optional(),
})

// --- Profile Actions ---

export async function updateProfile(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { status: "error", message: "Oturum açmanız gerekiyor" }
    }

    const rawData = {
        full_name: formData.get("full_name"),
        title: formData.get("title"),
        bio: formData.get("bio"),
        phone: formData.get("phone"),
        website: formData.get("website"),
        social_linkedin: formData.get("social_linkedin"),
        social_github: formData.get("social_github"),
        social_twitter: formData.get("social_twitter"),
    }

    const validatedFields = profileSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return { status: "error", message: "Veri doğrulama hatası" }
    }

    const { full_name, title, bio, phone, website, social_linkedin, social_github, social_twitter } =
        validatedFields.data

    const social_links = {
        linkedin: social_linkedin,
        github: social_github,
        twitter: social_twitter,
    }

    const { error } = await supabase
        .from("profiles")
        .update({
            full_name,
            title,
            bio,
            phone,
            website: website || null,
            social_links,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

    if (error) {
        console.error("Profile update error:", error)
        return { status: "error", message: "Profil güncellenirken bir hata oluştu" }
    }

    revalidatePath("/dashboard/gelistirici/profil")
    return { status: "success", message: "Profil başarıyla güncellendi" }
}

// --- Experience Actions ---

export async function addExperience(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase.from("experiences").insert({
        developer_id: user.id,
        ...data
    })

    if (error) return { error: error.message }
    revalidatePath("/dashboard/gelistirici/profil")
    return { success: true }
}

export async function deleteExperience(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase.from("experiences").delete().eq("id", id).eq("developer_id", user.id)

    if (error) return { error: error.message }
    revalidatePath("/dashboard/gelistirici/profil")
    return { success: true }
}

// --- Education Actions ---

export async function addEducation(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase.from("educations").insert({
        developer_id: user.id,
        ...data
    })

    if (error) return { error: error.message }
    revalidatePath("/dashboard/gelistirici/profil")
    return { success: true }
}

export async function deleteEducation(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase.from("educations").delete().eq("id", id).eq("developer_id", user.id)

    if (error) return { error: error.message }
    revalidatePath("/dashboard/gelistirici/profil")
    return { success: true }
}

// --- Certificate Actions ---

export async function addCertificate(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase.from("certificates").insert({
        developer_id: user.id,
        ...data
    })

    if (error) return { error: error.message }
    revalidatePath("/dashboard/gelistirici/profil")
    return { success: true }
}

export async function deleteCertificate(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Unauthorized" }

    const { error } = await supabase.from("certificates").delete().eq("id", id).eq("developer_id", user.id)

    if (error) return { error: error.message }
    revalidatePath("/dashboard/gelistirici/profil")
    return { success: true }
}

// --- Password Change Actions ---

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/),
    repeatPassword: z.string().min(1),
}).refine((data) => data.newPassword === data.repeatPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["repeatPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
    message: "Yeni şifre mevcut şifre ile aynı olamaz",
    path: ["newPassword"],
})

export async function changePassword(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { status: "error", message: "Oturum açmanız gerekiyor" }
    }

    const rawData = {
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword"),
        repeatPassword: formData.get("repeatPassword"),
    }

    const validatedFields = changePasswordSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return { status: "error", message: validatedFields.error.errors[0]?.message || "Veri doğrulama hatası" }
    }

    const { currentPassword, newPassword } = validatedFields.data

    // Mevcut şifreyi doğrula
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
    })

    if (signInError) {
        return { status: "error", message: "Mevcut şifre hatalı" }
    }

    // Şifreyi güncelle
    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
    })

    if (updateError) {
        console.error("Password update error:", updateError)
        return { status: "error", message: "Şifre güncellenirken bir hata oluştu" }
    }

    return { status: "success", message: "Şifre başarıyla güncellendi" }
}