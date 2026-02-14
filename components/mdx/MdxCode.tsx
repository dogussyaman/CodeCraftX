import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function MdxCodeInline({ className, ...props }: ComponentProps<"code">) {
  return (
    <code
      className={cn(
        "rounded bg-muted px-1.5 py-0.5 text-sm font-mono",
        className
      )}
      {...props}
    />
  )
}

export function MdxCodeBlock({
  className,
  children,
  ...props
}: ComponentProps<"code">) {
  return (
    <code
      className={cn(
        "block overflow-x-auto rounded-lg p-4 text-sm font-mono",
        className
      )}
      {...props}
    >
      {children}
    </code>
  )
}
