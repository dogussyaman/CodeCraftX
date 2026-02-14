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
      <body className="global-error-page">
        <div className="global-error-content">
          <h1 className="global-error-title">Kritik Hata</h1>
          <p className="global-error-description">
            Uygulama yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </p>
          <button type="button" onClick={() => reset()} className="global-error-button">
            Tekrar Dene
          </button>
        </div>
      </body>
    </html>
  )
}
