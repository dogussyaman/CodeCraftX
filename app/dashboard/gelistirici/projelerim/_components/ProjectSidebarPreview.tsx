"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Code2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ProjectSidebarPreviewProps {
  imageUrl: string
  title: string
  description: string
  longDescription: string
  technologiesString: string
}

export function ProjectSidebarPreview({
  imageUrl,
  title,
  description,
  longDescription,
  technologiesString,
}: ProjectSidebarPreviewProps) {
  const techList = technologiesString.split(",").map((t) => t.trim()).filter(Boolean)

  return (
    <div className="relative hidden min-h-0 w-full shrink-0 md:flex md:w-1/2 md:flex-col">
      <div className="flex flex-1 flex-col overflow-y-auto p-6">
        <Card className="overflow-hidden">
          {imageUrl ? (
            <div className="relative h-80 w-full bg-muted">
              <Image
                src={imageUrl}
                alt={title || "Proje görseli"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ) : (
            <div className="flex h-80 w-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <Code2 className="size-32 text-primary/30" />
            </div>
          )}
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-2">{title || "Proje adı"}</h2>
            <p className="text-muted-foreground mb-6">{description || "Kısa açıklama..."}</p>
            <Separator className="my-6" />
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">Proje Detayları</h3>
                <div className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {longDescription.trim() ? longDescription : description || "Detaylı açıklama burada görünecek."}
                  </ReactMarkdown>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Kullanılan Teknolojiler</h3>
                <div className="flex flex-wrap gap-2">
                  {techList.length > 0 ? (
                    techList.map((tek) => (
                      <Badge key={tek} variant="secondary" className="text-sm">
                        {tek}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Teknolojiler virgülle ayrılarak listelenecek.</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
