import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EventForm } from "../../_components/EventForm"
import type { PlatformEventRow } from "../../_components/EventForm"

export default async function AdminEtkinlikDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from("platform_events")
    .select("*")
    .eq("id", id)
    .single()

  if (!event) notFound()

  const { data: speakers } = await supabase
    .from("platform_event_speakers")
    .select("full_name, title, photo_url, linkedin_url, github_url, talk_title, sort_order")
    .eq("event_id", id)
    .order("sort_order", { ascending: true })

  const initialSpeakers = (speakers ?? []).map((s) => ({
    full_name: s.full_name,
    title: (s as { title?: string }).title ?? undefined,
    photo_url: (s as { photo_url?: string }).photo_url ?? undefined,
    linkedin_url: (s as { linkedin_url?: string }).linkedin_url ?? undefined,
    github_url: (s as { github_url?: string }).github_url ?? undefined,
    talk_title: (s as { talk_title?: string }).talk_title ?? undefined,
    sort_order: (s as { sort_order?: number }).sort_order ?? 0,
  }))

  return (
    <div className="space-y-6">
      <EventForm
        mode="edit"
        eventId={event.id}
        initialValues={event as unknown as Partial<PlatformEventRow>}
        initialSpeakers={initialSpeakers}
      />
    </div>
  )
}
