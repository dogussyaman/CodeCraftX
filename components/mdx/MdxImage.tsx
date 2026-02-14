import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function MdxImage({
  src,
  alt = "",
  className,
  ...props
}: ComponentProps<"img">) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("rounded-lg max-w-full h-auto my-4", className)}
      loading="lazy"
      {...props}
    />
  )
}
