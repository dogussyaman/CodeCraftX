import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type IconBg = "primary" | "green" | "amber" | "muted"

const iconBgClasses: Record<IconBg, string> = {
  primary: "rounded-xl bg-primary/10 p-2.5 [&_svg]:text-primary",
  green: "rounded-xl bg-green-500/10 p-2.5 [&_svg]:text-green-600 dark:[&_svg]:text-green-400",
  amber: "rounded-xl bg-amber-500/10 p-2.5 [&_svg]:text-amber-600 dark:[&_svg]:text-amber-400",
  muted: "rounded-xl bg-muted p-2.5 [&_svg]:text-muted-foreground",
}

interface StatCardProps {
  label: string
  value: React.ReactNode
  subText?: string
  icon: LucideIcon
  iconBg?: IconBg
  className?: string
}

export function StatCard({
  label,
  value,
  subText,
  icon: Icon,
  iconBg = "primary",
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-border bg-card shadow-sm overflow-hidden",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
            {subText && (
              <p className="text-xs text-muted-foreground mt-1">{subText}</p>
            )}
          </div>
          <div className={cn(iconBgClasses[iconBg])}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
