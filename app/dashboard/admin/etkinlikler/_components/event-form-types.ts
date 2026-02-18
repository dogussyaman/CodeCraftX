export type PlatformEventRow = {
  id: string
  title: string
  type: string
  short_description: string | null
  description: string | null
  cover_image_url: string | null
  tags: string[] | null
  start_date: string
  end_date: string | null
  timezone: string | null
  duration_hours: number | null
  is_online: boolean
  location: Record<string, unknown> | null
  online_link: string | null
  online_platform: string | null
  organizer_name: string | null
  organizer_logo_url: string | null
  organizer_website: string | null
  contact_email: string | null
  contact_phone: string | null
  attendance_type: string
  price: number
  max_participants: number | null
  registration_required: boolean
  registration_deadline: string | null
  is_team_event: boolean
  min_team_size: number | null
  max_team_size: number | null
  prizes: unknown[]
  theme_description: string | null
  jury: unknown[]
  mentors: unknown[]
  technologies: string[] | null
  status: string
  slug: string
  featured: boolean
}

export type Speaker = {
  full_name: string
  title?: string
  photo_url?: string
  linkedin_url?: string
  github_url?: string
  talk_title?: string
  sort_order?: number
}

export const EVENT_TYPES = [
  { value: "hackathon", label: "Hackathon" },
  { value: "seminer", label: "Seminer" },
  { value: "workshop", label: "Workshop" },
  { value: "konferans", label: "Konferans" },
  { value: "webinar", label: "Webinar" },
] as const

export function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ""
  try {
    const d = new Date(iso)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    const h = String(d.getHours()).padStart(2, "0")
    const min = String(d.getMinutes()).padStart(2, "0")
    return `${y}-${m}-${day}T${h}:${min}`
  } catch {
    return ""
  }
}
