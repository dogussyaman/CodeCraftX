import { z } from "zod"

/**
 * Şifre validasyonu için regex pattern
 * En az 8 karakter, büyük harf, küçük harf ve sayı içermeli
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&._-]{8,}$/

/**
 * Email validasyonu için regex pattern
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Telefon numarası validasyonu için regex pattern (Türkiye formatı)
 * +90 ile başlayan veya 0 ile başlayan formatlar kabul edilir
 */
const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/

/**
 * Kayıt formu validasyon şeması
 */
export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Ad soyad en az 2 karakter olmalıdır")
      .max(100, "Ad soyad en fazla 100 karakter olabilir")
      .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Ad soyad sadece harf içerebilir"),
    email: z
      .string()
      .min(1, "E-posta adresi gereklidir")
      .email("Geçerli bir e-posta adresi giriniz")
      .regex(emailRegex, "Geçerli bir e-posta formatı giriniz"),
    password: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .regex(passwordRegex, "Şifre en az bir büyük harf, bir küçük harf ve bir sayı içermelidir"),
    repeatPassword: z.string().min(1, "Şifre tekrarı gereklidir"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["repeatPassword"],
  })

/**
 * Giriş formu validasyon şeması
 */
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(1, "Şifre gereklidir"),
})

/**
 * İletişim formu validasyon şeması
 */
export const contactFormSchema = z.object({
  ad: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(100, "Ad en fazla 100 karakter olabilir"),
  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi giriniz"),
  konu: z.string().min(1, "Lütfen bir konu seçiniz"),
  mesaj: z
    .string()
    .min(10, "Mesaj en az 10 karakter olmalıdır")
    .max(5000, "Mesaj en fazla 5000 karakter olabilir"),
})

/**
 * Telefon numarası validasyon şeması
 */
export const phoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.length === 0) return true
      return phoneRegex.test(val.replace(/\s/g, ""))
    },
    {
      message: "Geçerli bir telefon numarası giriniz (örn: +905551234567 veya 05551234567)",
    }
  )

/**
 * Şifre unutma formu validasyon şeması
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi giriniz")
    .regex(emailRegex, "Geçerli bir e-posta formatı giriniz"),
})

/**
 * Şifre sıfırlama formu validasyon şeması
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .regex(passwordRegex, "Şifre en az bir büyük harf, bir küçük harf ve bir sayı içermelidir"),
    repeatPassword: z.string().min(1, "Şifre tekrarı gereklidir"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["repeatPassword"],
  })

/**
 * Şifre değiştirme formu validasyon şeması (giriş yapmış kullanıcılar için)
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifre gereklidir"),
    newPassword: z
      .string()
      .min(8, "Yeni şifre en az 8 karakter olmalıdır")
      .regex(passwordRegex, "Yeni şifre en az bir büyük harf, bir küçük harf ve bir sayı içermelidir"),
    repeatPassword: z.string().min(1, "Şifre tekrarı gereklidir"),
  })
  .refine((data) => data.newPassword === data.repeatPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["repeatPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Yeni şifre mevcut şifre ile aynı olamaz",
    path: ["newPassword"],
  })

/**
 * Destek talebi formu validasyon şeması
 * Giriş yapmamış kullanıcılar için email zorunludur; giriş yapmış kullanıcıda form oturumdan doldurur.
 */
export const supportTicketFormSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta adresi gereklidir")
    .email("Geçerli bir e-posta adresi giriniz")
    .regex(emailRegex, "Geçerli bir e-posta formatı giriniz"),
  type: z.enum(["login_error", "feedback", "technical", "other"], {
    required_error: "Talep türü seçiniz",
    invalid_type_error: "Geçerli bir talep türü seçiniz",
  }),
  subject: z
    .string()
    .min(1, "Konu gereklidir")
    .max(200, "Konu en fazla 200 karakter olabilir"),
  description: z
    .string()
    .min(10, "Açıklama en az 10 karakter olmalıdır")
    .max(5000, "Açıklama en fazla 5000 karakter olabilir"),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    required_error: "Öncelik seçiniz",
    invalid_type_error: "Geçerli bir öncelik seçiniz",
  }),
})

/**
 * Şirket kayıt talebi formu (girişli kullanıcı; user_id oturumdan alınır)
 * contact_email/contact_phone/contact_address admin şirket oluştururken kullanılır.
 */
const planEnum = z.enum(["free", "orta", "premium"])

export const companyRequestFormSchema = z.object({
  company_name: z
    .string()
    .min(2, "Şirket adı en az 2 karakter olmalıdır")
    .max(200, "Şirket adı en fazla 200 karakter olabilir"),
  company_website: z.string().max(500).optional(),
  company_description: z.string().max(2000).optional(),
  company_size: z.string().max(50).optional(),
  industry: z.string().max(100).optional(),
  reason: z
    .string()
    .min(10, "Gerekçe en az 10 karakter olmalıdır")
    .max(2000, "Gerekçe en fazla 2000 karakter olabilir"),
  contact_email: z
    .string()
    .max(255)
    .optional()
    .refine((val) => !val || emailRegex.test(val), "Geçerli bir e-posta adresi giriniz"),
  contact_phone: z.string().max(50).optional(),
  contact_address: z.string().max(500).optional(),
  plan: planEnum.optional().default("free"),
  billing_period: z.enum(["monthly", "annually"]).optional().default("monthly"),
})

export type SignUpFormValues = z.infer<typeof signUpSchema>
export type SignInFormValues = z.infer<typeof signInSchema>
export type ContactFormValues = z.infer<typeof contactFormSchema>
export type SupportTicketFormValues = z.infer<typeof supportTicketFormSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
export type CompanyRequestFormValues = z.infer<typeof companyRequestFormSchema>