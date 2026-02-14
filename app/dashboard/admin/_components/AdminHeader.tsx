import { Shield } from "lucide-react"

export function AdminHeader() {
  return (
    <div className="space-y-2 pb-2 border-b border-border">
      <div className="flex items-center gap-2">
        <Shield className="size-8 text-primary" aria-hidden />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Yönetim Paneli</h1>
          <p className="text-muted-foreground text-sm">Platform genel bakış ve yönetim</p>
        </div>
      </div>
    </div>
  )
}

