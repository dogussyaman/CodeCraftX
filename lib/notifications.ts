import {
  Bell,
  Briefcase,
  FileText,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  type LucideIcon,
} from "lucide-react"

export type NotificationType =
  | "new_application"
  | "application_status_changed"
  | "new_match"
  | "cv_processed"
  | "cv_failed"
  | "cv_downloaded"
  | "interview_invitation"
  | "interview_slot_confirmed"
  | "new_contact_message"
  | "support_ticket_resolved"
  | "system"

export interface NotificationTypeMeta {
  label: string
  icon: LucideIcon
}

const NOTIFICATION_TYPE_MAP: Record<string, NotificationTypeMeta> = {
  new_application: { label: "Başvuru", icon: Briefcase },
  application_status_changed: { label: "Durum", icon: FileText },
  new_match: { label: "Eşleşme", icon: CheckCircle2 },
  cv_processed: { label: "İşlem", icon: CheckCircle2 },
  support_ticket_resolved: { label: "Destek", icon: CheckCircle2 },
  cv_failed: { label: "Hata", icon: XCircle },
  cv_downloaded: { label: "CV indirildi", icon: FileText },
  interview_invitation: { label: "Görüşme daveti", icon: Briefcase },
  interview_slot_confirmed: { label: "Görüşme onayı", icon: CheckCircle2 },
  new_contact_message: { label: "İletişim", icon: Mail },
  system: { label: "Sistem", icon: AlertCircle },
}

const DEFAULT_META: NotificationTypeMeta = { label: "Bildirim", icon: Bell }

export function getNotificationTypeMeta(type: string): NotificationTypeMeta {
  return NOTIFICATION_TYPE_MAP[type] ?? DEFAULT_META
}

/** CTA text when notification has an action link. Role-based for interview types: "Başvurularım" only for developer. */
export function getNotificationCtaText(type: string, userRole?: string): string {
  switch (type) {
    case "new_application":
    case "new_match":
      return "İlana git"
    case "application_status_changed":
    case "cv_downloaded":
      return "Başvurularım"
    case "interview_invitation":
    case "interview_slot_confirmed":
      if (userRole === "developer") return "Başvurularım"
      if (userRole === "hr") return "Başvurular"
      return "Detay"
    case "support_ticket_resolved":
      return "Destek"
    case "new_contact_message":
      return "Görüntüle"
    default:
      return "Detay"
  }
}
