import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function MdxPre({ className, ...props }: ComponentProps<"pre">) {
  return (
    <pre
      className={cn("my-4 overflow-x-auto rounded-lg bg-muted", className)}
      {...props}
    />
  )
}
