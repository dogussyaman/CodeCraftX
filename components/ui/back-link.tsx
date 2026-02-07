import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BackLinkProps {
  href: string
  label?: string
  className?: string
}

export function BackLink({ href, label = "Geri Dön", className }: BackLinkProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={cn("text-muted-foreground hover:text-foreground", className)}
    >
      <Link href={href}>
        <ArrowLeft className="size-4" />
        <span>{label}</span>
      </Link>
    </Button>
  )
}
