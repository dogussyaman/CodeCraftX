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
}
