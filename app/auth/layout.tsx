import type React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-pages min-h-screen flex items-center justify-center bg-background" data-auth-page>
      {children}
    </div>
  )
}
