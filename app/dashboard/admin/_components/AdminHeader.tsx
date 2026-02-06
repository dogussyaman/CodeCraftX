import { Shield } from "lucide-react"

export function AdminHeader() {
  return (
    <div className="space-y-2 pb-2 border-b border-indigo-500/20">
      <div className="flex items-center gap-2">
        <Shield className="size-8 text-indigo-600 dark:text-indigo-400" aria-hidden />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Yönetim Paneli</h1>
          <p className="text-muted-foreground text-sm">Platform genel bakış ve yönetim</p>
        </div>
      </div>
    </div>
  )
}

