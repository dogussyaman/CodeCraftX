/**
 * Merkezi durum/rol/yetenek tipi → Badge variant eşlemesi.
 * Aynı işlev = aynı renk (token tabanlı).
 */

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "success"
  | "warning"
  | "accent"
  | "outline"

export interface StatusOption {
  label: string
  variant: BadgeVariant
}

/** Başvuru durumları: pending=warning, reviewed=primary, interview=accent, rejected=destructive, accepted=success */
export const APPLICATION_STATUS_MAP: Record<string, StatusOption> = {
  pending: { label: "Bekliyor", variant: "warning" },
  reviewed: { label: "İncelendi", variant: "default" },
  interview: { label: "Görüşme", variant: "accent" },
  rejected: { label: "Reddedildi", variant: "destructive" },
  accepted: { label: "Mülakat Aşamasında", variant: "success" },
} as const

/** Geliştirici başvuru sayfası için aynı map, "İnceleniyor" etiketi */
export const APPLICATION_STATUS_MAP_DEV = {
  ...APPLICATION_STATUS_MAP,
  pending: { label: "İnceleniyor", variant: "warning" as BadgeVariant },
} as const

/** Rol etiketleri: developer=primary, hr=success, admin=accent */
export const ROLE_BADGE_MAP: Record<string, StatusOption> = {
  developer: { label: "Geliştirici", variant: "default" },
  hr: { label: "İK Uzmanı", variant: "success" },
  admin: { label: "Yönetici", variant: "accent" },
  platform_admin: { label: "Platform Yöneticisi", variant: "accent" },
  company_admin: { label: "Şirket Yöneticisi", variant: "secondary" },
  mt: { label: "Mentor", variant: "secondary" },
} as const

/** Yetenek tipleri: programming=primary, framework=success, tool=accent, soft-skill=warning */
export const SKILL_TYPE_MAP: Record<string, StatusOption> = {
  programming: { label: "Programlama", variant: "default" },
  framework: { label: "Framework", variant: "success" },
  tool: { label: "Araç", variant: "accent" },
  "soft-skill": { label: "Soft Skill", variant: "warning" },
  language: { label: "Dil", variant: "secondary" },
  other: { label: "Diğer", variant: "outline" },
} as const
