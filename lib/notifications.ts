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
  | "interview_invitation"
  | "interview_response"
  | "new_match"
  | "cv_processed"
  | "cv_failed"
  | "cv_downloaded"
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
  interview_invitation: { label: "Görüşme", icon: FileText },
  interview_response: { label: "Görüşme", icon: CheckCircle2 },
  new_match: { label: "Eşleşme", icon: CheckCircle2 },
  cv_processed: { label: "İşlem", icon: CheckCircle2 },
  cv_downloaded: { label: "CV", icon: FileText },
  support_ticket_resolved: { label: "Destek", icon: CheckCircle2 },
  cv_failed: { label: "Hata", icon: XCircle },
  new_contact_message: { label: "İletişim", icon: Mail },
  system: { label: "Sistem", icon: AlertCircle },
}

const DEFAULT_META: NotificationTypeMeta = { label: "Bildirim", icon: Bell }

export function getNotificationTypeMeta(type: string): NotificationTypeMeta {
  return NOTIFICATION_TYPE_MAP[type] ?? DEFAULT_META
}

/** CTA text when notification has an action link */
export function getNotificationCtaText(type: string): string {
  switch (type) {
    case "new_application":
    case "new_match":
      return "İlana git"
    case "application_status_changed":
      return "Başvurularım"
    case "interview_invitation":
      return "Detaylar"
    case "interview_response":
      return "Başvurular"
    case "cv_downloaded":
      return "Başvurularım"
    case "support_ticket_resolved":
      return "Destek"
    case "new_contact_message":
      return "Görüntüle"
    default:
      return "Detay"
  }
}
