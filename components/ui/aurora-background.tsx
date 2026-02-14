"use client"

import { cn } from "@/lib/utils"

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  showRadialGradient?: boolean
}

export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden bg-background",
        className
      )}
      {...props}
    >
      <div
        className="absolute inset-0 h-full w-full opacity-40 dark:opacity-30 bg-size-[200%_200%] animate-aurora"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 80% at 50% -20%, var(--primary) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 100% 0%, var(--secondary) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 0% 0%, var(--accent) 0%, transparent 50%)
          `,
        }}
      />
      {showRadialGradient && (
        <div className="absolute inset-0 h-full w-full bg-[radial-gradient(circle_at_50%_120%,var(--background),transparent)]" />
      )}
      <div className="relative z-10 flex flex-col">{children}</div>
    </div>
  )
}
