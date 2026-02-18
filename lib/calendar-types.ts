/** Görüşmeye katılacak İK/şirket çalışanı (aday tarafında görünür) */
export interface CalendarEventAttendee {
  id: string
  full_name: string
  email?: string | null
}

/** Takvim sayfasında kullanılan görüşme/etkinlik modeli */
export interface CalendarEvent {
  date: string
  time: string
  title: string
  companyName: string
  meetLink?: string | null
  applicationId?: string
  interviewId?: string
  candidateName?: string
  candidateEmail?: string | null
  candidatePhone?: string | null
  /** Pozisyon lokasyonu (eşleşmelerdeki gibi) */
  jobLocation?: string | null
  /** Eşleşme puanı (0–100, varsa) */
  matchScore?: number | null
  /** Eşleşen yetenekler (eşleşmelerdeki gibi) */
  matchingSkills?: string[] | null
  /** Toplantıya katılacak İK çalışanları; aday bu isimleri görür */
  attendees?: CalendarEventAttendee[]
  /** Toplantı notları (İK tarafında düzenlenebilir) */
  notes?: string | null
  /** Platform etkinliği kayıtları için */
  eventId?: string
  eventType?: "interview" | "platform_event"
}
