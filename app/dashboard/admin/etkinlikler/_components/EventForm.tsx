"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { createEvent, updateEvent, type EventFormState } from "../actions"
import { toast } from "sonner"
import { EventFormHeader } from "./EventFormHeader"
import { EventFormTabBasic } from "./EventFormTabBasic"
import { EventFormTabDate } from "./EventFormTabDate"
import { EventFormTabLocation } from "./EventFormTabLocation"
import { EventFormTabOrg } from "./EventFormTabOrg"
import { EventFormTabKatilim } from "./EventFormTabKatilim"
import { EventFormTabHackathon } from "./EventFormTabHackathon"
import { EventFormTabSpeakers } from "./EventFormTabSpeakers"
import { EventFormTabYayin } from "./EventFormTabYayin"
import type { PlatformEventRow, Speaker } from "./event-form-types"

export type { PlatformEventRow } from "./event-form-types"

interface EventFormProps {
  mode: "create" | "edit"
  eventId?: string
  initialValues?: Partial<PlatformEventRow>
  initialSpeakers?: Speaker[]
  backHref?: string
  successRedirect?: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="gap-2">
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending ? "Kaydediliyor..." : "Kaydet"}
    </Button>
  )
}

const DEFAULT_BACK = "/dashboard/admin/etkinlikler"

export function EventForm({
  mode,
  eventId,
  initialValues,
  initialSpeakers = [],
  backHref = DEFAULT_BACK,
  successRedirect = DEFAULT_BACK,
}: EventFormProps) {
  const router = useRouter()
  const action =
    mode === "create"
      ? createEvent
      : (prev: EventFormState, fd: FormData) => updateEvent(eventId!, prev, fd)

  const [state, formAction] = useActionState(action, { ok: false })
  const [description, setDescription] = useState(initialValues?.description ?? "")
  const [type, setType] = useState(initialValues?.type ?? "seminer")
  const [isOnline, setIsOnline] = useState(initialValues?.is_online ?? true)
  const [attendanceType, setAttendanceType] = useState(initialValues?.attendance_type ?? "free")
  const [registrationRequired, setRegistrationRequired] = useState(initialValues?.registration_required ?? true)
  const [featured, setFeatured] = useState(initialValues?.featured ?? false)
  const [status, setStatus] = useState(initialValues?.status ?? "draft")
  const [isTeamEvent, setIsTeamEvent] = useState(initialValues?.is_team_event ?? false)
  const [speakers, setSpeakers] = useState<Speaker[]>(() =>
    initialSpeakers.length > 0
      ? initialSpeakers.map((s) => ({
          full_name: s.full_name,
          title: s.title,
          photo_url: s.photo_url,
          linkedin_url: s.linkedin_url,
          github_url: s.github_url,
          talk_title: s.talk_title,
          sort_order: s.sort_order,
        }))
      : []
  )

  const loc = initialValues?.location as { city?: string; address?: string; venue?: string; map_link?: string } | null | undefined
  const [locationCity, setLocationCity] = useState(loc?.city ?? "")
  const [locationAddress, setLocationAddress] = useState(loc?.address ?? "")
  const [locationVenue, setLocationVenue] = useState(loc?.venue ?? "")
  const [locationMapLink, setLocationMapLink] = useState(loc?.map_link ?? "")

  useEffect(() => {
    if (state.ok) {
      toast.success(mode === "create" ? "Etkinlik eklendi" : "Etkinlik güncellendi")
      if (mode === "create") router.push(successRedirect)
      else router.refresh()
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, mode, router, successRedirect])

  const locationJson = JSON.stringify({
    city: locationCity || undefined,
    address: locationAddress || undefined,
    venue: locationVenue || undefined,
    map_link: locationMapLink || undefined,
  })

  const addSpeaker = () => setSpeakers((s) => [...s, { full_name: "", sort_order: s.length }])
  const removeSpeaker = (i: number) => setSpeakers((s) => s.filter((_, idx) => idx !== i))
  const setSpeaker = (i: number, field: keyof Speaker, value: string | number) => {
    setSpeakers((s) => s.map((sp, idx) => (idx === i ? { ...sp, [field]: value } : sp)))
  }
  const speakersJson = JSON.stringify(speakers.filter((s) => s.full_name.trim()))

  return (
    <Card>
      <EventFormHeader mode={mode} backHref={backHref} />
      <CardContent>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="description" value={description} />
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="location" value={locationJson} />
          <input type="hidden" name="speakers" value={speakersJson} />
          <input type="hidden" name="prizes" value="[]" />
          <input type="hidden" name="jury" value="[]" />
          <input type="hidden" name="mentors" value="[]" />

          <Tabs defaultValue="temel" className="w-full">
            <TabsList className="flex h-auto w-full flex-nowrap overflow-x-auto rounded-lg p-1.5 gap-1 [scrollbar-width:thin]">
              <TabsTrigger value="temel" className="shrink-0">Temel</TabsTrigger>
              <TabsTrigger value="tarih" className="shrink-0">Tarih & Zaman</TabsTrigger>
              <TabsTrigger value="konum" className="shrink-0">Konum</TabsTrigger>
              <TabsTrigger value="org" className="shrink-0">Organizasyon</TabsTrigger>
              <TabsTrigger value="katilim" className="shrink-0">Katılım</TabsTrigger>
              <TabsTrigger value="hackathon" className="shrink-0">Hackathon</TabsTrigger>
              <TabsTrigger value="konusmacilar" className="shrink-0">Konuşmacılar</TabsTrigger>
              <TabsTrigger value="yayin" className="shrink-0">Yayın</TabsTrigger>
            </TabsList>

            <TabsContent value="temel">
              <EventFormTabBasic
                initialValues={initialValues}
                type={type}
                setType={setType}
                description={description}
                setDescription={setDescription}
              />
            </TabsContent>
            <TabsContent value="tarih">
              <EventFormTabDate initialValues={initialValues} />
            </TabsContent>
            <TabsContent value="konum">
              <EventFormTabLocation
                initialValues={initialValues}
                isOnline={isOnline}
                setIsOnline={setIsOnline}
                locationCity={locationCity}
                setLocationCity={setLocationCity}
                locationAddress={locationAddress}
                setLocationAddress={setLocationAddress}
                locationVenue={locationVenue}
                setLocationVenue={setLocationVenue}
                locationMapLink={locationMapLink}
                setLocationMapLink={setLocationMapLink}
              />
            </TabsContent>
            <TabsContent value="org">
              <EventFormTabOrg initialValues={initialValues} />
            </TabsContent>
            <TabsContent value="katilim">
              <EventFormTabKatilim
                initialValues={initialValues}
                attendanceType={attendanceType}
                setAttendanceType={setAttendanceType}
                registrationRequired={registrationRequired}
                setRegistrationRequired={setRegistrationRequired}
              />
            </TabsContent>
            <TabsContent value="hackathon">
              <EventFormTabHackathon
                initialValues={initialValues}
                isTeamEvent={isTeamEvent}
                setIsTeamEvent={setIsTeamEvent}
              />
            </TabsContent>
            <TabsContent value="konusmacilar">
              <EventFormTabSpeakers
                mode={mode}
                speakers={speakers}
                addSpeaker={addSpeaker}
                removeSpeaker={removeSpeaker}
                setSpeaker={setSpeaker}
              />
            </TabsContent>
            <TabsContent value="yayin">
              <EventFormTabYayin
                initialValues={initialValues}
                status={status}
                setStatus={setStatus}
                featured={featured}
                setFeatured={setFeatured}
              />
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4 border-t">
            <SubmitButton />
            <Button type="button" variant="outline" asChild>
              <Link href={backHref}>İptal</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
