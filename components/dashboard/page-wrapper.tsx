import { cn } from "@/lib/utils"

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  /** Default: max-w-7xl. Use "max-w-6xl" | "max-w-4xl" for narrower pages */
  maxWidth?: "max-w-7xl" | "max-w-6xl" | "max-w-4xl" | "max-w-2xl"
}

export function PageWrapper({ children, className, maxWidth = "max-w-7xl" }: PageWrapperProps) {
  return (
    <div
      className={cn(
        "container mx-auto px-4 py-8 space-y-8 min-h-screen",
        maxWidth,
        className,
      )}
    >
      {children}
    </div>
  )
}
