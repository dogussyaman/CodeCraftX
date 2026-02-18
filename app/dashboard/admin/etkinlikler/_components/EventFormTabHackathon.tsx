"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { PlatformEventRow } from "./event-form-types"

interface EventFormTabHackathonProps {
  initialValues?: Partial<PlatformEventRow>
  isTeamEvent: boolean
  setIsTeamEvent: (v: boolean) => void
}

export function EventFormTabHackathon({ initialValues, isTeamEvent, setIsTeamEvent }: EventFormTabHackathonProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Takım ile Katılım mı?</Label>
        <Select value={isTeamEvent ? "true" : "false"} onValueChange={(v) => setIsTeamEvent(v === "true")}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="false">Hayır</SelectItem>
            <SelectItem value="true">Evet</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="is_team_event" value={String(isTeamEvent)} />
      </div>
      {isTeamEvent && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="min_team_size">Min Takım Üyesi</Label>
            <Input id="min_team_size" name="min_team_size" type="number" min={1} defaultValue={initialValues?.min_team_size ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_team_size">Maks Takım Üyesi</Label>
            <Input id="max_team_size" name="max_team_size" type="number" min={1} defaultValue={initialValues?.max_team_size ?? ""} />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="theme_description">Tema / Problem Tanımı</Label>
        <Textarea
          id="theme_description"
          name="theme_description"
          rows={3}
          defaultValue={initialValues?.theme_description ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="technologies">Kullanılacak Teknolojiler (virgülle)</Label>
        <Input
          id="technologies"
          name="technologies"
          placeholder="React, Node.js, PostgreSQL"
          defaultValue={initialValues?.technologies?.join(", ") ?? ""}
        />
      </div>
    </div>
  )
}
