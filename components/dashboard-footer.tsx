import Link from "next/link"

function getPanelHref(role: string): string {
  if (role === "admin" || role === "platform_admin" || role === "mt") return "/dashboard/admin"
  if (role === "hr") return "/dashboard/ik"
  if (role === "company_admin") return "/dashboard/company"
  return "/dashboard/gelistirici"
}

interface DashboardFooterProps {
  role: string
  company?: { id: string; name: string | null; logo_url: string | null } | null
}

export function DashboardFooter({ role, company }: DashboardFooterProps) {
  const currentYear = new Date().getFullYear()
  const panelHref = getPanelHref(role)

  return (
    <footer className="mt-auto shrink-0 border-t bg-card text-card-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3 text-center sm:text-left">
            {company?.logo_url ? (
              <Link href="/dashboard/company" className="shrink-0">
                <img
                  src={company.logo_url}
                  alt=""
                  className="size-8 rounded object-contain border bg-muted"
                />
              </Link>
            ) : null}
            <div>
              <p className="text-sm font-medium">
                {company?.name ? (
                  <Link href="/dashboard/company" className="hover:underline">
                    {company.name}
                  </Link>
                ) : (
                  "CodeCraftX"
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                İş ilanları ve eşleştirme platformu
              </p>
            </div>
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
          © {currentYear} CodeCraftX
        </div>
      </div>
    </footer>
  )
}
