import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"
import type { JobPostingWithCompany } from "@/lib/dashboard-types"

interface HrRecentJobsProps {
    recentJobs: JobPostingWithCompany[] | null
}

export function HrRecentJobs({ recentJobs }: HrRecentJobsProps) {
    return (
        <Card className="bg-card border-border">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="size-5" />
                            Son İlanlar
                        </CardTitle>
                        <CardDescription>Yayınladığınız iş ilanları</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/ik/ilanlar/olustur">
                            <Plus className="mr-2 size-4" />
                            Yeni İlan
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {!recentJobs || recentJobs.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Briefcase className="size-12 mx-auto mb-4 opacity-20" />
                        <p>Henüz ilan yok</p>
                        <p className="text-sm mt-1">İlk iş ilanınızı oluşturun</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentJobs.map((job) => (
                            <div key={job.id} className="flex items-start justify-between p-4 border border-border rounded-lg">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground mb-1">{job.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-2">{job.companies?.name}</p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        {job.location && <span>{job.location}</span>}
                                        {job.job_type && <span className="capitalize">{job.job_type.replace("-", " ")}</span>}
                                        <span
                                            className={job.status === "active" ? "text-success" : "text-warning"}
                                        >
                                            {job.status === "active" ? "Aktif" : "Taslak"}
                                        </span>
                                    </div>
                                </div>
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/dashboard/ik/ilanlar/${job.id}`}>Görüntüle</Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

