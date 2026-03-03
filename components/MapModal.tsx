'use client'

import { useEffect, useRef, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { MapPin } from 'lucide-react'

interface MapModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    address: string
    eventTitle: string
}

interface GeoCoords {
    lng: number
    lat: number
}

/** Nominatim (OpenStreetMap) — completely free, no API key needed.
 * Added multi-stage fallback to handle complex/specific addresses better.
 */
async function geocodeAddress(
    address: string,
    signal: AbortSignal,
): Promise<GeoCoords | null> {
    const tryGeocode = async (query: string) => {
        const encoded = encodeURIComponent(query)
        const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`
        try {
            const res = await fetch(url, {
                signal,
                headers: {
                    'User-Agent': 'CodeCraftX/1.0 (https://codecraftx.xyz)',
                    'Accept-Language': 'tr',
                },
            })
            if (!res.ok) return null
            const data = await res.json()
            const result = data?.[0]
            if (!result) return null
            return { lng: parseFloat(result.lon), lat: parseFloat(result.lat) }
        } catch (e) {
            return null
        }
    }

    // 1. Try full address
    let coords = await tryGeocode(address)
    if (coords) return coords

    // 2. Fallback: Remove "No:X" or numbers which often break Nominatim
    const simpleAddress = address
        .replace(/No:\s*\d+/gi, '') // Remove No:123
        .replace(/\d+,\s*/g, '')    // Remove standalone numbers before commas
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .join(', ')

    if (simpleAddress !== address) {
        coords = await tryGeocode(simpleAddress)
        if (coords) return coords
    }

    // 3. Fallback: Just try the last two parts (usually Venue/Neighborhood + City)
    const parts = address.split(',').map(s => s.trim()).filter(Boolean)
    if (parts.length > 2) {
        const backupQuery = parts.slice(-2).join(', ')
        coords = await tryGeocode(backupQuery)
        if (coords) return coords
    }

    return null
}

export function MapModal({
    open,
    onOpenChange,
    address,
    eventTitle,
}: MapModalProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapRef = useRef<any>(null)
    const abortRef = useRef<AbortController | null>(null)

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    function cleanup() {
        abortRef.current?.abort()
        abortRef.current = null
        if (mapRef.current) {
            mapRef.current.remove()
            mapRef.current = null
        }
    }

    useEffect(() => {
        if (!open) {
            cleanup()
            setStatus('idle')
            return
        }

        setStatus('loading')
        const controller = new AbortController()
        abortRef.current = controller
        let cancelled = false

        geocodeAddress(address, controller.signal)
            .then(async (coords) => {
                if (cancelled) return
                if (!coords) {
                    setStatus('error')
                    return
                }

                setStatus('success')

                // Give React one tick to render the map container div
                await new Promise((r) => setTimeout(r, 50))
                if (cancelled || !mapContainerRef.current) return

                const maplibregl = (await import('maplibre-gl')).default

                const map = new maplibregl.Map({
                    container: mapContainerRef.current,
                    // OpenStreetMap Carto style via MapLibre demo tiles (free)
                    style: {
                        version: 8,
                        sources: {
                            osm: {
                                type: 'raster',
                                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                                tileSize: 256,
                                attribution:
                                    '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
                            },
                        },
                        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
                    },
                    center: [coords.lng, coords.lat],
                    zoom: 13,
                })

                mapRef.current = map

                const popup = new maplibregl.Popup({
                    offset: 28,
                    closeButton: false,
                    className: 'maplibre-popup-custom',
                }).setHTML(
                    `<div style="font-size:13px;font-weight:600;max-width:200px;white-space:normal;padding:4px 2px">${eventTitle}</div>`,
                )

                new maplibregl.Marker({ color: '#6366f1' })
                    .setLngLat([coords.lng, coords.lat])
                    .setPopup(popup)
                    .addTo(map)

                map.on('load', () => {
                    popup.addTo(map)
                })
            })
            .catch((err) => {
                if (err?.name === 'AbortError' || cancelled) return
                console.error('Map geocoding error:', err)
                setStatus('error')
            })

        return () => {
            cancelled = true
            cleanup()
            setStatus('idle')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, address])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-2xl w-full">
                <DialogHeader className="px-5 pt-5 pb-3">
                    <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                        <MapPin className="size-4 text-primary shrink-0" />
                        {eventTitle}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground truncate">{address}</p>
                </DialogHeader>

                {/* Map area */}
                <div className="relative w-full" style={{ height: 420 }}>
                    {status === 'loading' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30 z-10 gap-3">
                            <Spinner className="size-8 text-primary" />
                            <p className="text-sm text-muted-foreground">Konum yükleniyor…</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 z-10 gap-3">
                            <MapPin className="size-10 text-muted-foreground/50" />
                            <p className="text-sm font-medium text-muted-foreground">Konum bulunamadı</p>
                            <p className="text-xs text-muted-foreground/70">{address}</p>
                        </div>
                    )}

                    {/* Map container — rendered once the geocode returns successfully */}
                    {(status === 'success' || status === 'loading') && (
                        <div
                            ref={mapContainerRef}
                            className="absolute inset-0 w-full h-full"
                            style={{ visibility: status === 'success' ? 'visible' : 'hidden' }}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
