import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

const headingSizes: Record<string, string> = {
  h1: "text-3xl font-bold mt-10 mb-4 md:text-4xl",
  h2: "text-2xl font-bold mt-8 mb-3 md:text-3xl",
  h3: "text-xl font-bold mt-6 mb-2 md:text-2xl",
  h4: "text-lg font-bold mt-4 mb-2 md:text-xl",
  h5: "text-base font-bold mt-4 mb-2 md:text-lg",
  h6: "text-sm font-bold mt-3 mb-2 md:text-base",
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u00C0-\u024F-]/g, "")
}

function getTextFromChildren(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (Array.isArray(children)) return children.map(getTextFromChildren).join("")
  if (children != null && typeof children === "object" && "props" in children)
    return getTextFromChildren((children as { props: { children?: React.ReactNode } }).props.children)
  return ""
}

export function MdxHeading({
  level,
  children,
  className,
  ...props
}: { level: 1 | 2 | 3 | 4 | 5 | 6; children?: React.ReactNode } & ComponentProps<"h1">) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  const text = getTextFromChildren(children).trim()
  const id = text ? slugify(text) : undefined
  return (
    <Tag
      id={id}
      className={cn(headingSizes[Tag], "scroll-mt-20", className)}
      {...props}
    >
      {children}
    </Tag>
  )
}
