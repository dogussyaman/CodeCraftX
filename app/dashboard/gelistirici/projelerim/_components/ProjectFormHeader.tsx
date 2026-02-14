"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface ProjectFormHeaderProps {
  mode: "create" | "edit"
  noCard?: boolean
  listPath: string
}

export function ProjectFormHeader({ mode, noCard, listPath }: ProjectFormHeaderProps) {
  return (
    <div className={noCard ? "mb-6" : undefined}>
      {!noCard && (
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={listPath}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </div>
      )}
      <div className={noCard ? undefined : "mt-2"}>
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "create" ? "Yeni Proje" : "Projeyi Düzenle"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "create"
            ? "Proje bilgilerini girin. Taslak olarak kaydedip sonra yayınlayabilirsiniz."
            : "Proje bilgilerini güncelleyin."}
        </p>
      </div>
    </div>
  )
}
