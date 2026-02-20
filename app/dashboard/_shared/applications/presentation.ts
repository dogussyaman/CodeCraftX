import type { BadgeVariant } from "@/lib/status-variants"

export function roleContent(role: "company" | "hr") {
  if (role === "hr") {
    return {
      listTitle: "İK Başvuruları",
      listDescription: "İlan bazında başvuruları, ATS uyumunu ve süreç performansını yönetin.",
      detailTitle: "Başvuru Detayları",
      detailDescription: "Adayları ATS skoru ile önceliklendirin ve süreci hızlandırın.",
      emptyDescription: "İlan oluşturulduğunda bu ekrandan başvuruları takip edebilirsiniz.",
      detailHrefPrefix: "/dashboard/ik/basvurular",
    }
  }

  return {
    listTitle: "Başvurular",
    listDescription: "İlan bazında başvuruları, ATS uyumunu ve süreç performansını görüntüleyin.",
    detailTitle: "Başvuru Detayları",
    detailDescription: "Adayları ATS skoru ile değerlendirip süreci yönetin.",
    emptyDescription: "Önce bir ilan oluşturun, sonra başvuruları bu ekrandan yönetin.",
    detailHrefPrefix: "/dashboard/company/basvurular",
  }
}

export function jobStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Taslak"
    case "active":
    case "published":
      return "Yayında"
    case "in_review":
      return "İncelemede"
    case "archived":
      return "Arşiv"
    case "rejected":
      return "Reddedildi"
    case "closed":
      return "Kapali"
    case "approved":
      return "Onaylandı"
    case "scheduled":
      return "Zamanlandı"
    default:
      return status
  }
}

export function isPublished(status: string) {
  return status === "active" || status === "published"
}

export function jobStatusVariant(status: string): BadgeVariant {
  if (status === "active" || status === "published") return "success"
  if (status === "in_review") return "warning"
  if (status === "closed" || status === "rejected" || status === "archived") return "secondary"
  return "outline"
}

export function computeApplicationScore(opts: {
  matchScore?: number | null
  atsScores?: { final_score: number | null }[] | null
}) {
  if (typeof opts.matchScore === "number") return opts.matchScore
  if (typeof opts.atsScores?.[0]?.final_score === "number") return opts.atsScores[0].final_score
  return null
}

