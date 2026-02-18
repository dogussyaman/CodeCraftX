"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toDatetimeLocal } from "./event-form-types"
import type { PlatformEventRow } from "./event-form-types"

interface EventFormTabKatilimProps {
  initialValues?: Partial<PlatformEventRow>
  attendanceType: string
  setAttendanceType: (v: string) => void
  registrationRequired: boolean
  setRegistrationRequired: (v: boolean) => void
}

export function EventFormTabKatilim({
  initialValues,
  attendanceType,
  setAttendanceType,
  registrationRequired,
  setRegistrationRequired,
}: EventFormTabKatilimProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Katılım Türü</Label>
        <Select value={attendanceType} onValueChange={setAttendanceType}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Ücretsiz</SelectItem>
            <SelectItem value="paid">Ücretli</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="attendance_type" value={attendanceType} />
      </div>
      {attendanceType === "paid" && (
        <div className="space-y-2">
          <Label htmlFor="price">Katılım Ücreti</Label>
          <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={initialValues?.price ?? 0} />
        </div>
      )}
      <div className="space-y-2">
        <Label>Kayıt Gerekli mi?</Label>
        <Select value={registrationRequired ? "true" : "false"} onValueChange={(v) => setRegistrationRequired(v === "true")}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Evet</SelectItem>
            <SelectItem value="false">Hayır</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="registration_required" value={String(registrationRequired)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="max_participants">Kontenjan</Label>
        <Input
          id="max_participants"
          name="max_participants"
          type="number"
          min={1}
          placeholder="Sınırsız"
          defaultValue={initialValues?.max_participants ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="registration_deadline">Son Kayıt Tarihi</Label>
        <Input
          id="registration_deadline"
          name="registration_deadline"
          type="datetime-local"
          defaultValue={toDatetimeLocal(initialValues?.registration_deadline ?? null)}
        />
      </div>
    </div>
  )
}
