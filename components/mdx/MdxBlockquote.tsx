import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function MdxBlockquote({
  className,
  ...props
}: ComponentProps<"blockquote">) {
  return (
    <blockquote
      className={cn(
        "border-l-4 border-primary/50 pl-4 my-4 italic text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
