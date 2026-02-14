"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Mail, Phone, Briefcase, CheckCircle2, CalendarDays, Video, Clock } from "lucide-react"
import { CircularProgress } from "@/components/ui/circular-progress"

interface Match {
    id: string
    match_score: number
    status: string
    created_at: string
    matching_skills?: any
    missing_skills?: any
    job_postings?: {
        title?: string
        location?: string
    } | null
    profiles?: {
        full_name?: string
        email?: string
        phone?: string
    } | null
    interview?: {
        id: string
        date: string
        time: string
        meetLink: string | null
    }
}

interface Job {
    id: string
    title: string
}

interface MatchesWithFiltersProps {
    matches: Match[]
    jobs: Job[]
}

const STATUS_LABELS: Record<string, string> = {
    suggested: "Önerilen",
    viewed: "Görüntülendi",
    contacted: "İletişime Geçildi",
    rejected: "Reddedildi",
    hired: "Görüşme Yapılacak",
}

export function MatchesWithFilters({ matches, jobs }: MatchesWithFiltersProps) {
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [jobFilter, setJobFilter] = useState<string>("all")

    const filtered = useMemo(() => {
        return matches.filter((match) => {
            if (statusFilter !== "all" && match.status !== statusFilter) return false
            if (jobFilter !== "all" && match.job_postings?.title !== jobFilter) return false
            return true
        })
    }, [matches, statusFilter, jobFilter])

    const uniqueJobs = useMemo(() => {
        const jobTitles = new Set(matches.map((m) => m.job_postings?.title).filter(Boolean))
        return Array.from(jobTitles)
    }, [matches])

    if (matches.length === 0) {
        return (
            <Card className="rounded-2xl border-dashed border-border bg-muted/30 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <Star className="size-16 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-semibold mb-2">Henüz eşleşme yok</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                        Başvuruları kabul ettiğinizde veya AI önerileri oluşturulduğunda burada görünecek
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Durum filtrele" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tüm Durumlar</SelectItem>
                        <SelectItem value="suggested">Önerilen</SelectItem>
                        <SelectItem value="viewed">Görüntülendi</SelectItem>
                        <SelectItem value="contacted">İletişime Geçildi</SelectItem>
                        <SelectItem value="hired">İşe Alındı</SelectItem>
                        <SelectItem value="rejected">Reddedildi</SelectItem>
                    </SelectContent>
                </Select>

                {uniqueJobs.length > 1 && (
                    <Select value={jobFilter} onValueChange={setJobFilter}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="İlan filtrele" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm İlanlar</SelectItem>
                            {uniqueJobs.map((jobTitle) => (
                                <SelectItem key={jobTitle} value={jobTitle!}>
                                    {jobTitle}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">{filtered.length}</span>
                    <span>eşleşme gösteriliyor</span>
                </div>
            </div>

            {/* Matches List */}
            {filtered.length === 0 ? (
                <Card className="rounded-2xl border-dashed border-border bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Star className="size-12 text-muted-foreground mb-3 opacity-20" />
                        <p className="text-muted-foreground text-center">
                            Bu filtrelere uygun eşleşme bulunamadı
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filtered.map((match) => (
                        <Card
                            key={match.id}
                            className="rounded-2xl border border-border bg-card shadow-sm hover:border-primary/50 transition-all hover:shadow-md"
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex items-start gap-4 flex-1">
                                        <CircularProgress value={match.match_score} size={60} strokeWidth={5} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <CardTitle className="text-lg">{match.profiles?.full_name}</CardTitle>
                                                {match.status === "hired" && (
                                                    <Badge variant="success" className="gap-1">
                                                        <CheckCircle2 className="size-3" />
                                                        Mülakat Aşamasında
                                                    </Badge>
                                                )}
                                            </div>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <Briefcase className="size-3" />
                                                {match.job_postings?.title}
                                                {match.job_postings?.location && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{match.job_postings.location}</span>
                                                    </>
                                                )}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                        <Badge
                                            variant={
                                                match.status === "hired"
                                                    ? "success"
                                                    : match.status === "contacted"
                                                        ? "default"
                                                        : match.status === "rejected"
                                                            ? "destructive"
                                                            : "secondary"
                                            }
                                        >
                                            {STATUS_LABELS[match.status] || match.status}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex flex-wrap gap-4 text-sm">
                                    {match.profiles?.email && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="size-4" />
                                            <a
                                                href={`mailto:${match.profiles.email}`}
                                                className="hover:text-primary transition-colors"
                                            >
                                                {match.profiles.email}
                                            </a>
                                        </div>
                                    )}
                                    {match.profiles?.phone && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Phone className="size-4" />
                                            <a
                                                href={`tel:${match.profiles.phone}`}
                                                className="hover:text-primary transition-colors"
                                            >
                                                {match.profiles.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Görüşme detayları (Mülakat aşamasında + planlanmış görüşme varsa) */}
                                {match.status === "hired" && match.interview && (
                                    <div className="pt-3 border-t border-border/40 space-y-2">
                                        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                            <CalendarDays className="size-3.5" />
                                            Görüşme detayları
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-foreground">
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="size-3.5" />
                                                {match.interview.date} — {match.interview.time}
                                            </span>
                                            {match.interview.meetLink && (
                                                <a
                                                    href={match.interview.meetLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                                >
                                                    <Video className="size-3.5" />
                                                    Toplantı linki
                                                </a>
                                            )}
                                        </div>
                                        <Link
                                            href="/dashboard/ik/takvim"
                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                                        >
                                            <CalendarDays className="size-3.5" />
                                            Takvimde gör
                                        </Link>
                                    </div>
                                )}

                                {/* Skills */}
                                {match.matching_skills && Array.isArray(match.matching_skills) && match.matching_skills.length > 0 && (
                                    <div className="pt-2 border-t border-border/40">
                                        <div className="text-xs font-medium text-muted-foreground mb-1.5">
                                            Eşleşen Yetenekler
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {match.matching_skills.slice(0, 8).map((skill: string, idx: number) => (
                                                <Badge key={idx} variant="outline" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {match.matching_skills.length > 8 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{match.matching_skills.length - 8} daha
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
