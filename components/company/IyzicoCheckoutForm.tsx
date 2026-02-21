"use client"

import { useEffect, useRef } from "react"

// ─── helpers ──────────────────────────────────────────────────────────────────

function decodeBase64IfNeeded(raw: string): string {
  if (!raw || typeof raw !== "string") return ""
  const trimmed = raw.trim()
  try {
    if (/^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length % 4 === 0) {
      const binary = atob(trimmed)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      return new TextDecoder().decode(bytes)
    }
  } catch {
    // not base64 — treat as plain HTML
  }
  return trimmed
}

/**
 * iyzico formu inline göstermek için global override'lar.
 * - Modal wrapper → hidden
 * - Form container → static positioning
 */
const STYLE_ID = "iyzico-inline-overrides"
const OVERRIDES_CSS = `
/* Form wrapper'ı inline konuma çek */
#iyzipay-checkout-form,
.iyzipay-checkout-form,
[class*="iyzipay"] {
  position: static !important;
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 12px !important;
  max-width: 100% !important;
  margin: 0 !important;
  top: auto !important;
  left: auto !important;
  transform: none !important;
}
/* Backdrop / overlay gizle */
div[style*="position: fixed"],
div[style*="position:fixed"],
div[style*="background: rgba"],
div[style*="background:rgba"],
[class*="overlay"],
[class*="Overlay"],
[class*="backdrop"],
[class*="Backdrop"],
[class*="modal-backdrop"] {
  display: none !important;
}
/* X kapat & sandbox banner gizle */
.iyzipay-checkout-form-close,
[class*="close-button"],
[class*="closeButton"],
[aria-label="Close"],
button[title="Close"],
.iyzipay-checkout-form-sandbox,
[class*="sandbox-banner"],
[id*="sandbox-banner"] {
  display: none !important;
}
`

// ─── component ────────────────────────────────────────────────────────────────

export interface IyzicoCheckoutFormProps {
  checkoutFormContent: string
  className?: string
}

export function IyzicoCheckoutForm({
  checkoutFormContent,
  className,
}: IyzicoCheckoutFormProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const html = decodeBase64IfNeeded(checkoutFormContent)

  useEffect(() => {
    if (!containerRef.current || !html) return

    const container = containerRef.current

    // ── 1. Global CSS inject (bir kez) ─────────────────────────────────────
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style")
      style.id = STYLE_ID
      style.textContent = OVERRIDES_CSS
      document.head.appendChild(style)
    }

    // ── 2. HTML parse → script'leri ayır ───────────────────────────────────
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")

    const scripts = [
      ...Array.from(doc.head.querySelectorAll("script")),
      ...Array.from(doc.body.querySelectorAll("script")),
    ]
    scripts.forEach((s) => s.remove())

    // head'deki style/link taglerini koru
    Array.from(doc.head.childNodes).forEach((node) => {
      try {
        container.appendChild(document.importNode(node, true))
      } catch { /* skip */ }
    })

    container.insertAdjacentHTML("beforeend", doc.body.innerHTML)

    // ── 3. MutationObserver: iyzico'nun body'e eklediği modal'ı yakala ─────
    //
    // iyzico script'i çalışınca document.body'e position:fixed bir wrapper
    // ekler. Bu observer onu yakalayıp #iyzipay-checkout-form'u extract eder
    // ve bizim container'ımıza taşır; backdrop'u gizler.
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (!(node instanceof HTMLElement)) continue

          const inlineStyle = node.getAttribute("style") ?? ""
          const isFixedOverlay =
            inlineStyle.includes("position: fixed") ||
            inlineStyle.includes("position:fixed") ||
            node.className?.toLowerCase?.().includes("overlay") ||
            node.className?.toLowerCase?.().includes("backdrop")

          if (isFixedOverlay) {
            // iyzico formunu bu wrapper'ın içinden çıkar
            const form =
              node.querySelector<HTMLElement>("#iyzipay-checkout-form") ??
              node.querySelector<HTMLElement>(".iyzipay-checkout-form")

            if (form) {
              // inline gösterim için position sıfırla
              form.style.cssText =
                "position:static!important;background:transparent!important;" +
                "box-shadow:none!important;border-radius:12px!important;" +
                "max-width:100%!important;margin:0!important;"

              // Wrapper içindeki boş #iyzipay-checkout-form placeholder'ını bul
              const placeholder = container.querySelector<HTMLElement>(
                "#iyzipay-checkout-form, .iyzipay-checkout-form"
              )
              if (placeholder) {
                placeholder.replaceWith(form)
              } else {
                container.appendChild(form)
              }
            }

            // Backdrop wrapper'ı gizle
            node.style.display = "none"
          }
        }
      }
    })

    observer.observe(document.body, { childList: true })

    // ── 4. Script'leri sırayla çalıştır ────────────────────────────────────
    for (const oldScript of scripts) {
      const newScript = document.createElement("script")

      if (oldScript.src) {
        newScript.src = oldScript.src
        newScript.async = false
      } else {
        newScript.textContent = oldScript.textContent
      }

      Array.from(oldScript.attributes).forEach((attr) => {
        if (attr.name !== "src" && attr.name !== "async") {
          try { newScript.setAttribute(attr.name, attr.value) } catch { /* skip */ }
        }
      })

      container.appendChild(newScript)
    }

    return () => {
      observer.disconnect()
    }
  }, [html])

  if (!html) return null

  return (
    <div
      ref={containerRef}
      className={`iyzico-checkout-root w-full ${className ?? ""}`}
    />
  )
}
