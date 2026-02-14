import { ProjectForm } from "@/app/dashboard/gelistirici/projelerim/_components/ProjectForm"
import { Code2 } from "lucide-react"

export default function AdminYeniProjePage() {
  return (
    <div className="flex flex-1 min-h-0 flex-col rounded-xl border border-border/50 bg-background shadow-sm md:flex-row md:overflow-hidden">
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
      <div className="flex flex-1 min-h-0 min-w-0">
        <ProjectForm
          mode="create"
          noCard
          redirectBasePath="/dashboard/admin/projeler"
          listPath="/dashboard/admin/projeler"
          showSidebarPreview
        />
      </div>
    </div>
  )
}
