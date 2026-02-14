"use client"
import { Button } from "@/components/ui/button"
import { Plus, Briefcase } from "lucide-react"
import Link from "next/link"

export default function AdminJobsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8 min-h-screen max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Briefcase className="size-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">İş İlanları</h1>
            <p className="text-sm text-muted-foreground">Tüm platform ilanlarını görüntüleyin ve yönetin</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/ilanlar/olustur">
            <Plus className="mr-2 size-4" />
            Yeni İlan
          </Link>
        </Button>
      </div>
    </div>
  )
}