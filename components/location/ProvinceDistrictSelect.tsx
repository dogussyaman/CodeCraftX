"use client"

import { useProvinces } from "@/hooks/use-provinces"
import { DEFAULT_COUNTRY } from "@/lib/provinces-types"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface ProvinceDistrictSelectValues {
  country: string
  city: string
  district: string
}

interface ProvinceDistrictSelectProps {
  country?: string
  city: string
  district: string
  onChange: (value: ProvinceDistrictSelectValues) => void
  districtOptional?: boolean
  /** Compact layout for filter sidebar (smaller labels/inputs) */
  compact?: boolean
}

export function ProvinceDistrictSelect({
  city,
  district,
  onChange,
  districtOptional = true,
  compact = false,
}: ProvinceDistrictSelectProps) {
  const { provinces, getDistricts, loading } = useProvinces()
  const districts = getDistricts(city)

  const handleCityChange = (value: string) => {
    onChange({
      country: DEFAULT_COUNTRY,
      city: value,
      district: "",
    })
  }

  const handleDistrictChange = (value: string) => {
    onChange({
      country: DEFAULT_COUNTRY,
      city,
      district: value,
    })
  }

  const labelClass = compact ? "text-xs text-muted-foreground" : ""
  const triggerClass = compact ? "mt-1 h-9" : "mt-1"

  if (loading) {
    return (
      <div className="space-y-3">
        <div>
          <Label className={labelClass}>İl</Label>
          <div className={`${triggerClass} rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground`}>
            Yükleniyor...
          </div>
        </div>
        <div>
          <Label className={labelClass}>İlçe (opsiyonel)</Label>
          <div className={`${triggerClass} rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground`}>
            —
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="province-select" className={labelClass}>
          İl
        </Label>
        <Select value={city || "__none__"} onValueChange={(v) => handleCityChange(v === "__none__" ? "" : v)}>
          <SelectTrigger id="province-select" className={triggerClass + " w-full"}>
            <SelectValue placeholder="İl seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">İl seçin</SelectItem>
            {provinces.map((p) => (
              <SelectItem key={p.id} value={p.name}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="district-select" className={labelClass}>
          İlçe {districtOptional ? "(opsiyonel)" : ""}
        </Label>
        <Select
          value={district || "__none__"}
          onValueChange={(v) => handleDistrictChange(v === "__none__" ? "" : v)}
          disabled={!city}
        >
          <SelectTrigger id="district-select" className={triggerClass + " w-full"}>
            <SelectValue placeholder={city ? "İlçe seçin" : "Önce il seçin"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">{city ? "İlçe seçin" : "—"}</SelectItem>
            {districts.map((d) => (
              <SelectItem key={d.id} value={d.name}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
