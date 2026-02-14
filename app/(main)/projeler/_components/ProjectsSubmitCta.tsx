import Link from "next/link"
import { Button } from "@/components/ui/button"

const DEFAULT_PROJE_YENI_HREF = "/dashboard/gelistirici/projelerim/yeni"

interface ProjectsSubmitCtaProps {
  /** Rol bazlı: admin için /dashboard/admin/projeler/yeni, diğerleri için geliştirici yeni proje */
  projectSubmitHref?: string
}

export function ProjectsSubmitCta({ projectSubmitHref = DEFAULT_PROJE_YENI_HREF }: ProjectsSubmitCtaProps) {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Kendi Projenizi Paylaşın</h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Geliştirdiğiniz açık kaynak projeleri topluluğumuzla paylaşmak için başvurun
          </p>
          <Button size="lg" asChild>
            <Link href={projectSubmitHref}>Proje Gönder</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

