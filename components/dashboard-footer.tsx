import Link from "next/link"
import { Sparkles } from "lucide-react"

function getPanelHref(role: string): string {
  if (role === "admin" || role === "platform_admin" || role === "mt") return "/dashboard/admin"
  if (role === "hr") return "/dashboard/ik"
  if (role === "company_admin") return "/dashboard/company"
  return "/dashboard/gelistirici"
}

interface DashboardFooterProps {
  role: string
  company?: { id: string; name: string | null; logo_url: string | null } | null
  plan?: string
}

export function DashboardFooter({ role, company, plan }: DashboardFooterProps) {
  const currentYear = new Date().getFullYear()
  const panelHref = getPanelHref(role)
  const isPremium = plan === "premium"

  return (
    <footer
      className={
        isPremium
          ? "mt-auto shrink-0 border-t border-amber-500/20 bg-card text-card-foreground"
          : "mt-auto shrink-0 border-t bg-card text-card-foreground"
      }
    >
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
              <p className="text-sm font-medium flex items-center gap-2 flex-wrap">
                {company?.name ? (
                  <Link href="/dashboard/company" className="hover:underline">
                    {company.name}
                  </Link>
                ) : (
                  "CodeCraftX"
                )}
                {isPremium && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                    <Sparkles className="size-3" />
                    Premium
                  </span>
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
