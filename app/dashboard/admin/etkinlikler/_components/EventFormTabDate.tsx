"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toDatetimeLocal } from "./event-form-types"
import type { PlatformEventRow } from "./event-form-types"

interface EventFormTabDateProps {
  initialValues?: Partial<PlatformEventRow>
}

export function EventFormTabDate({ initialValues }: EventFormTabDateProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_date">Başlangıç Tarihi & Saati *</Label>
          <Input
            id="start_date"
            name="start_date"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocal(initialValues?.start_date)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Bitiş Tarihi & Saati</Label>
          <Input
            id="end_date"
            name="end_date"
            type="datetime-local"
            defaultValue={toDatetimeLocal(initialValues?.end_date ?? null)}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="timezone">Zaman Dilimi</Label>
        <Input
          id="timezone"
          name="timezone"
          placeholder="Europe/Istanbul"
          defaultValue={initialValues?.timezone ?? "Europe/Istanbul"}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="duration_hours">Süre (saat)</Label>
        <Input
          id="duration_hours"
          name="duration_hours"
          type="number"
          step="0.5"
          min={0}
          placeholder="2"
          defaultValue={initialValues?.duration_hours ?? ""}
        />
      </div>
    </div>
  )
}
