import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Briefcase, ChevronRight, MapPin, Star, TrendingUp, Upload } from "lucide-react"
import type { MatchWithJob } from "@/lib/dashboard-types"

interface DeveloperRecentMatchesProps {
    cvCount: number | null
    recentMatches: MatchWithJob[] | null
}

export function DeveloperRecentMatches({ cvCount, recentMatches }: DeveloperRecentMatchesProps) {
    const hasCv = !!cvCount && cvCount > 0

    return (
        <div className="lg:col-span-2 space-y-6">
            {!hasCv && (
                <div className="bg-warning/10 border border-warning/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="p-4 bg-warning/20 rounded-full shrink-0">
                        <Upload className="size-8 text-warning" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-semibold text-lg text-foreground mb-1">Henüz CV Yüklemediniz</h3>
                        <p className="text-muted-foreground text-sm mb-4 sm:mb-0">
                            Size en uygun iş ilanlarını bulabilmemiz için CV&apos;nizi yükleyerek profilinizi oluşturun.
                        </p>
                    </div>
                    <Button asChild variant="default" className="shrink-0">
                        <Link href="/dashboard/gelistirici/cv">
                            <Upload className="mr-2 size-4" />
                            CV Yükle
                        </Link>
                    </Button>
                </div>
            )}

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="size-5 text-primary" />
                    Son Eşleşmeler
                </h2>
                <Button variant="ghost" size="sm" asChild className="hover:bg-primary/5 hover:text-primary">
                    <Link href="/dashboard/gelistirici/eslesmeler">
                        Tümünü Gör <ChevronRight className="ml-1 size-4" />
                    </Link>
                </Button>
            </div>

            <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {!recentMatches || recentMatches.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                            <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <Star className="size-8 text-muted-foreground/40" />
                            </div>
                            <h3 className="font-medium text-lg mb-1">Henüz eşleşme yok</h3>
                            <p className="text-muted-foreground text-sm max-w-sm">
                                CV&apos;niz analiz edildiğinde ve uygun ilanlar bulunduğunda burada listelenecekler.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {recentMatches.map((match) => (
                                <div
                                    key={match.id}
                                    className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="size-12 rounded-lg bg-background border flex items-center justify-center shrink-0 shadow-sm">
                                        <span className="font-bold text-primary text-lg">
                                            {match.job_postings?.companies?.name?.substring(0, 1) || "C"}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CardTitle className="text-base font-semibold text-foreground truncate">
                                                {match.job_postings?.title}
                                            </CardTitle>
                                            <Badge
                                                variant="secondary"
                                                className="bg-primary/10 text-primary border-0 pointer-events-none text-[10px] px-2 h-5"
                                            >
                                                %{match.match_score}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                {match.job_postings?.companies?.name}
                                            </span>
                                            {match.job_postings?.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="size-3" />
                                                    {match.job_postings.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        asChild
                                        className="shrink-0 w-full sm:w-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                    >
                                        <Link href={`/dashboard/gelistirici/eslesmeler/${match.id}`}>
                                            İncele
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

