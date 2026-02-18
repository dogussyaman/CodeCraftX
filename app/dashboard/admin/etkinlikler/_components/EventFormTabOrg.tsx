"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PlatformEventRow } from "./event-form-types"

interface EventFormTabOrgProps {
  initialValues?: Partial<PlatformEventRow>
}

export function EventFormTabOrg({ initialValues }: EventFormTabOrgProps) {
  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="organizer_name">Organizatör Adı</Label>
        <Input
          id="organizer_name"
          name="organizer_name"
          placeholder="Şirket veya topluluk adı"
          defaultValue={initialValues?.organizer_name ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="organizer_logo_url">Organizatör Logo URL</Label>
        <Input
          id="organizer_logo_url"
          name="organizer_logo_url"
          type="url"
          defaultValue={initialValues?.organizer_logo_url ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="organizer_website">Organizatör Web Sitesi</Label>
        <Input
          id="organizer_website"
          name="organizer_website"
          type="url"
          defaultValue={initialValues?.organizer_website ?? ""}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact_email">İletişim E-posta</Label>
          <Input id="contact_email" name="contact_email" type="email" defaultValue={initialValues?.contact_email ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_phone">Telefon</Label>
          <Input id="contact_phone" name="contact_phone" placeholder="+90 ..." defaultValue={initialValues?.contact_phone ?? ""} />
        </div>
      </div>
    </div>
  )
}
