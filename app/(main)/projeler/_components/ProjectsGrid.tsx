import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader,CardTitle } from "@/components/ui/card"
import { Eye, Github, Heart } from "lucide-react"
import Image from "next/image"

interface ProjectsGridProps {
    projeler: any[] | null
}

export function ProjectsGrid({ projeler }: ProjectsGridProps) {
    return (
        <section className="pb-16">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {projeler && projeler.length > 0 ? (
                        projeler.map((proje: any) => {
                            const teknolojiler = Array.isArray(proje.technologies)
                                ? proje.technologies
                                : JSON.parse(proje.technologies || "[]")

                            return (
                                <Card
                                    key={proje.id}
                                    className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 pt-0" 
                                >
                                    <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                                        <Image
                                            src={proje.image_url}
                                            alt={proje.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="group-hover:text-primary transition-colors">
                                            <Link href={`/projeler/${proje.id}`}>{proje.title}</Link>
                                        </CardTitle>
                                        <CardDescription>{proje.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            {teknolojiler.slice(0, 4).map((tek: string, i: number) => (
                                                <Badge key={`${proje.id}-tech-${i}`} variant="secondary" className="text-xs">
                                                    {tek}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Heart className="size-4" />
                                                <span>{proje.stars?.toLocaleString("tr-TR") || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye className="size-4" />
                                                <span>{proje.views?.toLocaleString("tr-TR") || 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            {proje.github_url && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 bg-transparent"
                                                    asChild
                                                >
                                                    <a
                                                        href={proje.github_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Github className="size-4 mr-2" />
                                                        GitHub
                                                    </a>
                                                </Button>
                                            )}
                                            <Button size="sm" className="flex-1" asChild>
                                                <Link href={`/projeler/${proje.id}`}>Detay</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <p className="text-muted-foreground">Henüz proje bulunmuyor.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

