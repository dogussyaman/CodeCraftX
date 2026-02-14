"use client"

import * as React from "react"
import { format, parseISO, startOfDay } from "date-fns"
import { tr } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Video, Clock, Building2, CalendarDays, Mail, Phone, FileText, Users, UserPlus, Briefcase, MapPin, Star } from "lucide-react"
import type { CalendarEvent } from "@/lib/calendar-types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const HAS_EVENT_CLASS =
  "relative after:content-[''] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-green-500 after:border after:border-background"

interface TakvimViewProps {
  events: CalendarEvent[]
  title?: string
  subtitle?: string
  emptyMessage?: string
  /** İK görünümünde toplantı notları ve katılımcı daveti düzenlenebilir */
  canEditNotes?: boolean
}

interface HrProfile {
  id: string
  full_name: string
  email?: string
}

export function TakvimView({
  events,
  title = "Takvim",
  subtitle = "Görüşme takviminiz",
  emptyMessage = "Bu tarihte görüşme yok",
  canEditNotes = false,
}: TakvimViewProps) {
  const today = startOfDay(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(today)
  const [editingNotes, setEditingNotes] = React.useState<Record<string, string>>({})
  const [savingId, setSavingId] = React.useState<string | null>(null)
  const [attendeesSavingId, setAttendeesSavingId] = React.useState<string | null>(null)
  const [localAttendees, setLocalAttendees] = React.useState<Record<string, CalendarEvent["attendees"]>>({})

  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      const list = map.get(e.date) ?? []
      list.push(e)
      map.set(e.date, list)
    }
    return map
  }, [events])

  const datesWithEvents = React.useMemo(
    () => Array.from(eventsByDate.keys()).map((d) => parseISO(d + "T12:00:00")),
    [eventsByDate]
  )

  const selectedKey = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : null
  const dayEvents = selectedKey ? eventsByDate.get(selectedKey) ?? [] : []

  const handleSaveNotes = async (interviewId: string, notes: string) => {
    setSavingId(interviewId)
    try {
      const res = await fetch(`/api/interviews/${interviewId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      })
      if (!res.ok) throw new Error("Kaydedilemedi")
      toast.success("Toplantı notu kaydedildi")
      setEditingNotes((prev) => ({ ...prev, [interviewId]: notes }))
    } catch {
      toast.error("Not kaydedilemedi")
    } finally {
      setSavingId(null)
    }
  }

  const handleSaveAttendees = async (interviewId: string, ids: string[]) => {
    setAttendeesSavingId(interviewId)
    try {
      const res = await fetch(`/api/interviews/${interviewId}/attendees`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invited_attendee_ids: ids }),
      })
      if (!res.ok) throw new Error("Kaydedilemedi")
      toast.success("Katılımcılar güncellendi")
    } catch {
      toast.error("Katılımcılar kaydedilemedi")
    } finally {
      setAttendeesSavingId(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-primary/10 p-3">
          <CalendarDays className="size-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 rounded-2xl border border-border bg-card shadow-sm">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              defaultMonth={today}
              locale={tr}
              modifiers={{
                hasEvent: datesWithEvents,
              }}
              modifiersClassNames={{
                hasEvent: HAS_EVENT_CLASS,
              }}
              classNames={{
                day: cn(),
              }}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="pb-2 border-b bg-muted/30">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              {selectedDate
                ? format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })
                : "Tarih seçin"}
            </CardTitle>
            <p className="text-sm text-muted-foreground font-normal">
              {selectedDate && dayEvents.length > 0
                ? `${dayEvents.length} görüşme`
                : selectedDate
                  ? emptyMessage
                  : "Takvimden bir gün seçin"}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {!selectedDate ? (
              <div className="p-6">
                <p className="text-sm text-muted-foreground italic">
                  Görüşme detaylarını görmek için takvimden bir tarih seçin.
                </p>
              </div>
            ) : dayEvents.length === 0 ? (
              <div className="p-6">
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {dayEvents.map((evt, i) => (
                  <EventDetailCard
                    key={evt.interviewId ?? evt.applicationId ?? i}
                    evt={evt}
                    canEditNotes={canEditNotes}
                    editingNotes={editingNotes}
                    setEditingNotes={setEditingNotes}
                    savingId={savingId}
                    handleSaveNotes={handleSaveNotes}
                    attendeesSavingId={attendeesSavingId}
                    handleSaveAttendees={handleSaveAttendees}
                    localAttendees={localAttendees}
                    setLocalAttendees={setLocalAttendees}
                  />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EventDetailCard({
  evt,
  canEditNotes,
  editingNotes,
  setEditingNotes,
  savingId,
  handleSaveNotes,
  attendeesSavingId,
  handleSaveAttendees,
  localAttendees,
  setLocalAttendees,
}: {
  evt: CalendarEvent
  canEditNotes: boolean
  editingNotes: Record<string, string>
  setEditingNotes: React.Dispatch<React.SetStateAction<Record<string, string>>>
  savingId: string | null
  handleSaveNotes: (interviewId: string, notes: string) => Promise<void>
  attendeesSavingId: string | null
  handleSaveAttendees: (interviewId: string, ids: string[]) => Promise<void>
  localAttendees: Record<string, CalendarEvent["attendees"]>
  setLocalAttendees: React.Dispatch<React.SetStateAction<Record<string, CalendarEvent["attendees"]>>>
}) {
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [hrProfiles, setHrProfiles] = React.useState<HrProfile[]>([])
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set((evt.attendees ?? []).map((a) => a.id)))

  const currentAttendees = evt.interviewId && localAttendees[evt.interviewId] != null
    ? localAttendees[evt.interviewId]
    : evt.attendees ?? []

  const loadHrProfiles = React.useCallback(async () => {
    const res = await fetch("/api/companies/my/hr-profiles")
    const data = await res.json()
    if (data.profiles) setHrProfiles(data.profiles)
  }, [])

  React.useEffect(() => {
    setSelectedIds(new Set((evt.attendees ?? []).map((a) => a.id)))
  }, [evt.attendees, evt.interviewId])

  const onInviteOpen = (open: boolean) => {
    setInviteOpen(open)
    if (open && hrProfiles.length === 0) loadHrProfiles()
  }

  const onSaveAttendees = async () => {
    if (!evt.interviewId) return
    const ids = Array.from(selectedIds)
    await handleSaveAttendees(evt.interviewId, ids)
    const names = hrProfiles.filter((p) => ids.includes(p.id)).map((p) => ({ id: p.id, full_name: p.full_name, email: p.email ?? null }))
    setLocalAttendees((prev) => ({ ...prev, [evt.interviewId!]: names }))
    setInviteOpen(false)
  }

  return (
    <li className="p-4 md:p-5 bg-card hover:bg-muted/20 transition-colors">
      <div className="space-y-4">
        {/* Başlık ve tarih/saat */}
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground shrink-0" />
            {evt.companyName}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">{evt.title}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-4" />
              {evt.time}
            </span>
            {evt.meetLink && (
              <a
                href={evt.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
              >
                <Video className="size-4" />
                Toplantı linki
              </a>
            )}
          </div>
        </div>

        {/* Aday bilgileri (eşleşmelerdeki tüm alanlar; sadece aday verisi varken) */}
        {(evt.candidateName || evt.candidateEmail || evt.candidatePhone) && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="size-3.5" />
              Aday bilgileri
            </div>
            {evt.candidateName && (
              <p className="font-medium text-foreground">{evt.candidateName}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {evt.candidateEmail && (
                <a href={`mailto:${evt.candidateEmail}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  <Mail className="size-3.5" />
                  {evt.candidateEmail}
                </a>
              )}
              {evt.candidatePhone && (
                <a href={`tel:${evt.candidatePhone}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  <Phone className="size-3.5" />
                  {evt.candidatePhone}
                </a>
              )}
            </div>
            {evt.jobLocation && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {evt.jobLocation}
              </p>
            )}
            {evt.matchScore != null && (
              <div className="flex items-center gap-2">
                <Star className="size-4 text-amber-500" />
                <span className="text-sm font-medium">%{evt.matchScore} eşleşme</span>
              </div>
            )}
            {evt.matchingSkills && evt.matchingSkills.length > 0 && (
              <div className="pt-1">
                <p className="text-xs text-muted-foreground mb-1">Eşleşen yetenekler</p>
                <div className="flex flex-wrap gap-1">
                  {evt.matchingSkills.slice(0, 8).map((s, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs font-normal">
                      {s}
                    </Badge>
                  ))}
                  {evt.matchingSkills.length > 8 && (
                    <Badge variant="outline" className="text-xs">+{evt.matchingSkills.length - 8}</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Katılımcılar (toplantıya katılacak İK) */}
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Users className="size-3.5" />
              Katılımcılar
              {currentAttendees && currentAttendees.length > 0 && (
                <span className="normal-case font-normal">({currentAttendees.length})</span>
              )}
            </span>
            {canEditNotes && evt.interviewId && (
              <Popover open={inviteOpen} onOpenChange={onInviteOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                    <UserPlus className="size-3.5" />
                    Davet et
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3" align="end">
                  <p className="text-xs text-muted-foreground mb-2">Görüşmeye katılacak İK çalışanlarını seçin</p>
                  <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
                    {hrProfiles.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Yükleniyor...</p>
                    ) : (
                      hrProfiles.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={(e) => {
                              setSelectedIds((prev) => {
                                const next = new Set(prev)
                                if (e.target.checked) next.add(p.id)
                                else next.delete(p.id)
                                return next
                              })
                            }}
                            className="rounded border-input"
                          />
                          <span className="font-medium">{p.full_name}</span>
                          {p.email && <span className="text-muted-foreground text-xs truncate">{p.email}</span>}
                        </label>
                      ))
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={attendeesSavingId === evt.interviewId}
                    onClick={onSaveAttendees}
                  >
                    {attendeesSavingId === evt.interviewId ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </PopoverContent>
              </Popover>
            )}
          </div>
          {currentAttendees && currentAttendees.length > 0 ? (
            <ul className="text-sm space-y-1">
              {currentAttendees.map((a) => (
                <li key={a.id} className="flex items-center gap-2">
                  <span className="font-medium">{a.full_name}</span>
                  {a.email && <span className="text-muted-foreground text-xs">{a.email}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">Henüz katılımcı eklenmedi</p>
          )}
        </div>

        {/* Toplantı notları */}
        {(evt.notes != null || canEditNotes) && evt.interviewId && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <FileText className="size-3.5" />
              Toplantı notları
            </div>
            {canEditNotes ? (
              <div className="space-y-2">
                <Textarea
                  placeholder="Görüşme notlarınızı yazın..."
                  className="min-h-[80px] text-sm resize-none"
                  value={editingNotes[evt.interviewId] ?? evt.notes ?? ""}
                  onChange={(e) =>
                    setEditingNotes((prev) => ({
                      ...prev,
                      [evt.interviewId!]: e.target.value,
                    }))
                  }
                />
                <Button
                  size="sm"
                  disabled={savingId === evt.interviewId}
                  onClick={() =>
                    handleSaveNotes(
                      evt.interviewId!,
                      editingNotes[evt.interviewId!] ?? evt.notes ?? ""
                    )
                  }
                >
                  {savingId === evt.interviewId ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {evt.notes || "—"}
              </p>
            )}
          </div>
        )}
      </div>
    </li>
  )
}
