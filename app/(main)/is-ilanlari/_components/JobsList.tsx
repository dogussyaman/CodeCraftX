import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Building2, Clock, DollarSign, MapPin } from "lucide-react"

interface JobsListProps {
    ilanlar: any[] | null
}

const jobTypeLabel: Record<string, string> = {
  "full-time": "Tam Zamanlı",
  "part-time": "Yarı Zamanlı",
  contract: "Sözleşmeli",
  internship: "Staj",
  freelance: "Freelance",
}

export function JobsList({ ilanlar }: JobsListProps) {
  return (
    <section className="pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-5">
          {ilanlar && ilanlar.length > 0 ? (
            ilanlar.map((ilan: any) => (
              <Card
                key={ilan.id}
                className="rounded-xl border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 overflow-hidden"
              >
                <Link href={`/is-ilanlari/${ilan.id}`} className="block">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="secondary" className="rounded-md font-medium">
                            {ilan.experience_level}
                          </Badge>
                          <Badge variant="outline" className="rounded-md">
                            {jobTypeLabel[ilan.job_type] ?? ilan.job_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-auto md:ml-0 flex items-center gap-1">
                            <Clock className="size-3" />
                            {new Date(ilan.created_at).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                        <CardTitle className="text-lg font-semibold hover:text-primary transition-colors mb-2 line-clamp-1">
                          {ilan.title}
                        </CardTitle>
                        <CardDescription className="space-y-1.5 text-sm">
                          <div className="flex items-center gap-2">
                            <Building2 className="size-4 shrink-0" />
                            <span>{ilan.companies?.name}</span>
                          </div>
                          {ilan.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="size-4 shrink-0" />
                              <span>{ilan.location}</span>
                            </div>
                          )}
                          {(ilan.salary_min != null || ilan.salary_max != null) && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="size-4 shrink-0" />
                              <span>
                                {ilan.salary_min != null && ilan.salary_max != null
                                  ? `₺${ilan.salary_min.toLocaleString("tr-TR")} - ₺${ilan.salary_max.toLocaleString("tr-TR")}`
                                  : ilan.salary_min != null
                                    ? `₺${ilan.salary_min.toLocaleString("tr-TR")}+`
                                    : `₺${ilan.salary_max?.toLocaleString("tr-TR")}`}
                              </span>
                            </div>
                          )}
                        </CardDescription>
                      </div>
                      <span className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shrink-0 md:mt-0">
                        Detay
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {ilan.job_skills?.slice(0, 5).map((js: any, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs rounded-md font-normal">
                          {js.skills?.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 rounded-xl border border-dashed border-border bg-muted/30">
              <p className="text-muted-foreground">Bu kriterlere uygun ilan bulunmuyor.</p>
              <p className="text-sm text-muted-foreground mt-1">Farklı filtreler deneyebilirsiniz.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

