"use client"

import * as React from "react"
import { format, parseISO, startOfDay } from "date-fns"
import { tr } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Clock, Building2, CalendarDays } from "lucide-react"
import type { CalendarEvent } from "@/lib/calendar-types"
import { cn } from "@/lib/utils"

const HAS_EVENT_CLASS =
  "relative after:content-[''] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-green-500 after:border after:border-background"

interface TakvimViewProps {
  events: CalendarEvent[]
  title?: string
  subtitle?: string
  emptyMessage?: string
}

export function TakvimView({
  events,
  title = "Takvim",
  subtitle = "Görüşme takviminiz",
  emptyMessage = "Bu tarihte görüşme yok",
}: TakvimViewProps) {
  const today = startOfDay(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(today)

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

        <Card className="lg:col-span-2 rounded-2xl border border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
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
          <CardContent className="space-y-3">
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground italic">
                Görüşme detaylarını görmek için takvimden bir tarih seçin.
              </p>
            ) : dayEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            ) : (
              <ul className="space-y-3">
                {dayEvents.map((evt, i) => (
                  <li
                    key={evt.interviewId ?? evt.applicationId ?? i}
                    className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/30 p-3 text-sm"
                  >
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <Building2 className="size-4 text-muted-foreground shrink-0" />
                      {evt.companyName}
                    </div>
                    <div className="text-muted-foreground">{evt.title}</div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {evt.time}
                      </span>
                      {evt.meetLink && (
                        <a
                          href={evt.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <Video className="size-3.5" />
                          Toplantı linki
                        </a>
                      )}
                    </div>
                    {evt.candidateName && (
                      <div className="text-xs text-muted-foreground">
                        Aday: {evt.candidateName}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
