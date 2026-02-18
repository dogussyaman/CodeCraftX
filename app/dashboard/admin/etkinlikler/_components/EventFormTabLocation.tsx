"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PlatformEventRow } from "./event-form-types"

interface EventFormTabLocationProps {
  initialValues?: Partial<PlatformEventRow>
  isOnline: boolean
  setIsOnline: (v: boolean) => void
  locationCity: string
  setLocationCity: (v: string) => void
  locationAddress: string
  setLocationAddress: (v: string) => void
  locationVenue: string
  setLocationVenue: (v: string) => void
  locationMapLink: string
  setLocationMapLink: (v: string) => void
}

export function EventFormTabLocation({
  initialValues,
  isOnline,
  setIsOnline,
  locationCity,
  setLocationCity,
  locationAddress,
  setLocationAddress,
  locationVenue,
  setLocationVenue,
  locationMapLink,
  setLocationMapLink,
}: EventFormTabLocationProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Online / Fiziksel</Label>
        <Select value={isOnline ? "true" : "false"} onValueChange={(v) => setIsOnline(v === "true")}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Online</SelectItem>
            <SelectItem value="false">Fiziksel</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="is_online" value={String(isOnline)} />
      </div>
      {isOnline ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="online_link">Etkinlik Linki (Zoom / Meet / Teams)</Label>
            <Input
              id="online_link"
              name="online_link"
              type="url"
              placeholder="https://..."
              defaultValue={initialValues?.online_link ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="online_platform">Platform Türü</Label>
            <Input
              id="online_platform"
              name="online_platform"
              placeholder="Zoom, Google Meet, Teams"
              defaultValue={initialValues?.online_platform ?? ""}
            />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="location_city">Şehir</Label>
            <Input id="location_city" value={locationCity} onChange={(e) => setLocationCity(e.target.value)} placeholder="İstanbul" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location_venue">Mekan Adı</Label>
            <Input id="location_venue" value={locationVenue} onChange={(e) => setLocationVenue(e.target.value)} placeholder="Mekan adı" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location_address">Adres</Label>
            <Input id="location_address" value={locationAddress} onChange={(e) => setLocationAddress(e.target.value)} placeholder="Tam adres" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location_map_link">Harita Linki (Google Maps)</Label>
            <Input
              id="location_map_link"
              value={locationMapLink}
              onChange={(e) => setLocationMapLink(e.target.value)}
              type="url"
              placeholder="https://maps.google.com/..."
            />
          </div>
        </>
      )}
    </div>
  )
}
