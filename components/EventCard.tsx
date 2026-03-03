'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Video, Map } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Glow from '@/components/ui/glow'
import { MapModal } from '@/components/MapModal'

const TYPE_LABELS: Record<string, string> = {
    hackathon: 'Hackathon',
    seminer: 'Seminer',
    workshop: 'Workshop',
    konferans: 'Konferans',
    webinar: 'Webinar',
}

interface EventCardProps {
    id: string
    title: string
    slug: string
    type: string
    short_description?: string | null
    start_date?: string | null
    is_online?: boolean
    location?: { city?: string; venue?: string; address?: string } | null
    cover_image_url?: string | null
    tags?: string[] | null
    featured?: boolean
    attendance_type?: string
    price?: number
}

export function EventCard({
    title,
    slug,
    type,
    short_description,
    start_date,
    is_online,
    location,
    cover_image_url,
    tags,
    featured,
    attendance_type,
    price,
}: EventCardProps) {
    const [mapOpen, setMapOpen] = useState(false)

    const start = start_date ? new Date(start_date) : null
    const locationLabel = is_online
        ? 'Online'
        : location?.city ?? location?.venue ?? 'Yer bilgisi yok'

    // Build the address string for geocoding
    const addressParts = [
        location?.address,
        location?.venue,
        location?.city,
    ].filter(Boolean)
    const addressString = addressParts.length > 0
        ? addressParts.join(', ')
        : locationLabel

    const hasPhysicalLocation = !is_online && addressString && addressString !== 'Yer bilgisi yok'

    return (
        <>
            <div className="relative block h-full">
                <Link href={`/etkinlikler/${slug}`} className="block h-full">
                    <Card className="relative h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md dark:hover:bg-muted/5 dark:hover:border-muted-foreground/10">
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                            <Glow variant="bottom" className="opacity-60" />
                        </div>
                        <div className="relative pt-3 px-3">
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                                {cover_image_url ? (
                                    <img
                                        src={cover_image_url}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="size-full flex items-center justify-center text-muted-foreground/50">
                                        <Calendar className="size-12" />
                                    </div>
                                )}
                                <div className="absolute top-2 left-2 z-10 flex gap-1.5">
                                    <Badge variant="secondary" className="text-xs">
                                        {TYPE_LABELS[type] ?? type}
                                    </Badge>
                                    {featured && (
                                        <Badge variant="default" className="text-xs">
                                            Öne çıkan
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                        <CardContent className="relative p-4 pt-3 space-y-2">
                            <h3 className="font-semibold text-foreground line-clamp-2 leading-snug">
                                {title}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs font-normal">
                                    {attendance_type === 'free' ? 'Ücretsiz' : `Ücretli · ${price ?? 0} TL`}
                                </Badge>
                            </div>
                            {short_description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {short_description}
                                </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {is_online ? (
                                    <Video className="size-3.5 shrink-0" />
                                ) : (
                                    <MapPin className="size-3.5 shrink-0" />
                                )}
                                <span>{locationLabel}</span>
                            </div>
                            {start && (
                                <p className="text-xs text-muted-foreground">
                                    {start.toLocaleDateString('tr-TR', {
                                        weekday: 'short',
                                        day: 'numeric',
                                        month: 'short',
                                    })}{' '}
                                    ·{' '}
                                    {start.toLocaleTimeString('tr-TR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            )}
                            {tags?.length ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.slice(0, 4).map((t) => (
                                        <Badge key={t} variant="outline" className="text-xs font-normal">
                                            {t}
                                        </Badge>
                                    ))}
                                </div>
                            ) : null}
                            <div className="pt-3">
                                <span className="inline-flex items-center justify-center rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                                    Detaylar
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* "Haritada Gör" button — outside Link to avoid nested <a> */}
                {hasPhysicalLocation && (
                    <div className="px-4 pb-4 -mt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 transition-colors"
                            onClick={(e) => {
                                e.preventDefault()
                                setMapOpen(true)
                            }}
                        >
                            <Map className="size-4" />
                            Haritada Gör
                        </Button>
                    </div>
                )}
            </div>

            {hasPhysicalLocation && (
                <MapModal
                    open={mapOpen}
                    onOpenChange={setMapOpen}
                    address={addressString}
                    eventTitle={title}
                />
            )}
        </>
    )
}
