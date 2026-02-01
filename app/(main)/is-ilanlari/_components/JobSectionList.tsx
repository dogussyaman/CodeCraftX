import { cn } from "@/lib/utils"

interface JobSectionListProps {
  title: string
  subtitle?: string
  items: string[]
  className?: string
}

export function JobSectionList({ title, subtitle, items, className }: JobSectionListProps) {
  const hasTitle = typeof title === "string" && title.trim().length > 0
  if (items.length === 0 && !hasTitle && !subtitle) return null

  return (
    <div className={cn("space-y-3", className)}>
      {hasTitle && (
        <h2 className="text-2xl font-bold">{title}</h2>
      )}
      {subtitle && typeof subtitle === "string" && subtitle.trim().length > 0 && (
        <p className="text-muted-foreground text-base">{subtitle}</p>
      )}
      {items.length > 0 && (
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          {items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
