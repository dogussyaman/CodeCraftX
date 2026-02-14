"use client"

import * as React from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  subMonths,
  addMonths,
} from "date-fns"
import { tr } from "date-fns/locale"
import { ChevronLeft, ChevronRight, CalendarCheck, Info, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CalendarEvent } from "@/lib/calendar-types"

const WEEKDAY_LABELS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"]

const EVENT_COLORS = [
  "bg-blue-500/90 text-white border-blue-600",
  "bg-emerald-500/90 text-white border-emerald-600",
  "bg-violet-500/90 text-white border-violet-600",
  "bg-amber-500/90 text-white border-amber-600",
  "bg-rose-500/90 text-white border-rose-600",
  "bg-cyan-500/90 text-white border-cyan-600",
]

function getEventColor(index: number): string {
  return EVENT_COLORS[index % EVENT_COLORS.length]
}

interface CalendarMonthViewProps {
  events: CalendarEvent[]
  title?: string
  /** Seçili tarih (bugün veya ay içinde vurgulanır) */
  selectedDate?: Date
  onSelectDate?: (date: Date) => void
  /** Tıklanan etkinlik – detay göstermek için */
  onEventClick?: (event: CalendarEvent) => void
  /** Görünüm başlığı (örn. "Takvim") */
  viewTitle?: string
  /** Alt başlık (örn. "Planlanan görüşmeleriniz") */
  viewSubtitle?: string
}

export function CalendarMonthView({
  events,
  title = "Takvim",
  selectedDate,
  onSelectDate,
  onEventClick,
  viewTitle = "Takvim",
  viewSubtitle = "Görüşmeler",
}: CalendarMonthViewProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => {
    const d = selectedDate ?? new Date()
    return startOfMonth(d)
  })

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 })

  const eventsByDate = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of events) {
      const list = map.get(e.date) ?? []
      list.push(e)
      map.set(e.date, list)
    }
    return map
  }, [events])

  const eventCount = events.length

  const upcomingCount = events.filter((e) => {
    try {
      return new Date(e.date + "T23:59:59") >= new Date()
    } catch {
      return false
    }
  }).length

  return (
    <div className="flex flex-col gap-4 min-h-screen bg-gradient-to-b from-muted/20 to-background">
      <div className="container mx-auto px-4 pt-6 max-w-7xl">
        {/* Header - big-calendar style */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {viewTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground dark:text-foreground/75">
              {viewSubtitle}
            </p>
          </div>
        </header>

        {/* Calendar toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-lg font-semibold text-foreground">
              {format(currentMonth, "MMMM yyyy", { locale: tr })}
            </span>
            <span className="text-sm text-muted-foreground dark:text-foreground/70">
              {eventCount} görüşme
            </span>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                {format(selectedDate ?? new Date(), "d MMM", { locale: tr }).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground dark:text-foreground/70">
              {format(monthStart, "d MMM yyyy", { locale: tr })} – {format(monthEnd, "d MMM yyyy", { locale: tr })}
            </span>
            <div className="flex rounded-lg border border-border bg-card p-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                aria-label="Önceki ay"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md"
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                aria-label="Sonraki ay"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Month grid */}
        <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="py-2.5 text-center text-xs font-semibold text-muted-foreground dark:text-foreground/80 uppercase tracking-wider"
              >
                {label}
              </div>
            ))}
          </div>
          {/* Weeks */}
          <div className="divide-y divide-border">
            {weeks.map((weekStart) => (
              <div key={weekStart.toISOString()} className="grid grid-cols-7 min-h-[100px] sm:min-h-[120px]">
                {Array.from({ length: 7 }).map((_, i) => {
                  const day = addDays(weekStart, i)
                  const key = format(day, "yyyy-MM-dd")
                  const dayEvents = eventsByDate.get(key) ?? []
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)

                  return (
                    <div
                      key={key}
                      className={cn(
                        "flex flex-col border-r border-border last:border-r-0 p-1.5 bg-card",
                        !isCurrentMonth && "bg-muted/20"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectDate?.(day)}
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                          isSelected && "bg-primary text-primary-foreground",
                          isToday(day) && !isSelected && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background",
                          isCurrentMonth ? "text-foreground hover:bg-muted" : "text-muted-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </button>
                      <div className="mt-1 flex flex-1 flex-col gap-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map((evt, idx) => (
                          <button
                            key={evt.interviewId ?? evt.applicationId ?? idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onEventClick?.(evt)
                            }}
                            className={cn(
                              "text-left rounded-md px-1.5 py-1 text-xs font-medium truncate border border-transparent hover:opacity-90 transition-opacity",
                              getEventColor(idx)
                            )}
                            title={`${evt.title} – ${evt.time}`}
                          >
                            <span className="block truncate">{evt.title}</span>
                            <span className="block truncate opacity-90">{evt.time}</span>
                          </button>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-xs text-muted-foreground dark:text-foreground/70 px-1.5 py-0.5">
                            +{dayEvents.length - 3} daha...
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Takvim altı: özet ve bilgi alanı */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <CalendarCheck className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums text-foreground">{eventCount}</p>
                <p className="text-xs font-medium text-muted-foreground dark:text-foreground/70">
                  Bu ay toplam görüşme
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Video className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-semibold tabular-nums text-foreground">{upcomingCount}</p>
                <p className="text-xs font-medium text-muted-foreground dark:text-foreground/70">
                  Yaklaşan görüşme
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Info className="size-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">İpucu</p>
                <p className="mt-0.5 text-xs text-muted-foreground dark:text-foreground/70">
                  Görüşmeye tıklayarak detayları, toplantı linkini ve aday bilgilerini görebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
