import { Spinner } from "@/components/ui/spinner"

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <Spinner className="size-8 text-primary" />
      <p className="text-sm font-medium text-muted-foreground">
        Panele yönlendiriliyorsunuz…
      </p>
    </div>
  )
}
