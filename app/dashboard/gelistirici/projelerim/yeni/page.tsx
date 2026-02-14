import Image from "next/image"
import Link from "next/link"
import { ProjectForm } from "../_components/ProjectForm"
import { Code2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function YeniProjePage() {
  return (
    <div className="flex flex-1 min-h-0 flex-col rounded-xl border border-border/50 bg-background shadow-sm md:flex-row md:overflow-hidden">
      {/* Sol: dekoratif alan - gradient + görsel */}
      <div className="relative hidden min-h-[180px] w-full shrink-0 md:flex md:min-h-0 md:w-1/2 md:flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20" />
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-primary/15">
            <Code2 className="size-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Projenizi paylaşın
          </h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Açık kaynak projenizi toplulukla buluşturun. Taslak olarak kaydedip istediğiniz zaman yayınlayabilirsiniz.
          </p>
          <div className="relative mt-8 aspect-video w-full max-w-md overflow-hidden rounded-xl border border-border/50 bg-muted/30">
            <Image
              src="/hero.png"
              alt=""
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 0px, 50vw"
            />
          </div>
        </div>
      </div>
      {/* Mobil: üstte ince banner */}
      <div className="flex items-center gap-3 rounded-t-xl bg-gradient-to-r from-primary/15 to-secondary/15 px-4 py-3 md:hidden">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20">
          <Code2 className="size-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Yeni Proje</p>
          <p className="text-xs text-muted-foreground">Projenizi toplulukla paylaşın</p>
        </div>
      </div>
      {/* Sağ: form - scroll */}
      <div className="flex flex-1 flex-col overflow-y-auto border-t border-border/50 md:border-l md:border-t-0">
        <div className="flex flex-1 flex-col p-6 md:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-lg">
            <Button variant="ghost" size="sm" className="-ml-2 mb-4" asChild>
              <Link href="/dashboard/gelistirici/projelerim">← Projelerime dön</Link>
            </Button>
            <ProjectForm mode="create" noCard />
          </div>
        </div>
      </div>
    </div>
  )
}
