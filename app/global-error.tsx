"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="tr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0a0a0a", color: "#fafafa", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 700, marginBottom: "0.5rem" }}>Kritik Hata</h1>
          <p style={{ color: "#a1a1aa", marginBottom: "1.5rem" }}>
            Uygulama yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 500,
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  )
}
