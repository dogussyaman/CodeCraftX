"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface EventFormHeaderProps {
  mode: "create" | "edit"
  backHref: string
}

export function EventFormHeader({ mode, backHref }: EventFormHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={backHref}>
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
        </Button>
        <div>
          <CardTitle>{mode === "create" ? "Yeni etkinlik" : "Etkinliği düzenle"}</CardTitle>
          <CardDescription>
            {mode === "create" ? "Etkinlik bilgilerini doldurun." : "Etkinlik bilgilerini güncelleyin."}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
  )
}
