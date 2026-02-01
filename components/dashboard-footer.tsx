import Link from "next/link"

function getPanelHref(role: string): string {
  if (role === "admin" || role === "platform_admin" || role === "mt") return "/dashboard/admin"
  if (role === "hr") return "/dashboard/ik"
  if (role === "company_admin") return "/dashboard/company"
  return "/dashboard/gelistirici"
}

interface DashboardFooterProps {
  role: string
}

export function DashboardFooter({ role }: DashboardFooterProps) {
  const currentYear = new Date().getFullYear()
  const panelHref = getPanelHref(role)

  return (
    <footer className="mt-auto shrink-0 border-t bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium">CodeCrafters</p>
            <p className="text-xs text-muted-foreground">
              İş ilanları ve eşleştirme platformu
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm">
            <Link
              href={panelHref}
              className="text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
            >
              Panel
            </Link>
            <Link
              href="/destek"
              className="text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
            >
              Destek
            </Link>
            <Link
              href="/iletisim"
              className="text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
            >
              İletişim
            </Link>
          </nav>
        </div>
        <div className="mt-4 border-t pt-4 text-center text-xs text-muted-foreground">
          © {currentYear} CodeCrafters
        </div>
      </div>
    </footer>
  )
}
