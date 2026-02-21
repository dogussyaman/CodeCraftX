"use client"

/**
 * iyzico checkoutFormContent: Base64 veya düz HTML.
 * iframe ile ödeme detaylarının yanında tek yapı olarak render; çift modal iframe içi CSS ile gizlenir.
 */
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
    // not base64
  }
  return trimmed
}

/** iyzico overlay/backdrop/sandbox gizlenir; iframe içinde ikinci form/modal gizlenir (çift yapı önlenir) */
function injectStyles(html: string): string {
  const styleTag = `
<style>
  html, body { background: transparent !important; margin: 0 !important; padding: 0 !important; }
  #iyzipay-checkout-form, .iyzipay-checkout-form { background: transparent !important; box-shadow: none !important; border-radius: 0 !important; }
  #iyzipay-checkout-form > div:first-child[style*="background"], .iyzipay-checkout-form-sandbox, [class*="sandbox"], [id*="sandbox"] { display: none !important; }
  #overlay, .overlay, [class*="overlay"], [class*="modal-backdrop"], [class*="backdrop"] { background: transparent !important; backdrop-filter: none !important; }
  .iyzipay-checkout-form-close, [class*="close-button"], [aria-label="Close"], button[title="Close"] { display: none !important; }
  body #iyzipay-checkout-form ~ #iyzipay-checkout-form, body .iyzipay-checkout-form ~ .iyzipay-checkout-form { display: none !important; }
</style>`
  if (html.includes("</head>")) {
    return html.replace("</head>", `${styleTag}</head>`)
  }
  return styleTag + html
}

export interface IyzicoCheckoutFormProps {
  checkoutFormContent: string
  className?: string
}

export function IyzicoCheckoutForm({
  checkoutFormContent,
  className,
}: IyzicoCheckoutFormProps) {
  const rawHtml = decodeBase64IfNeeded(checkoutFormContent)
  if (!rawHtml) return null
  const html = injectStyles(rawHtml)

  return (
    <iframe
      title="iyzico ödeme formu"
      srcDoc={html}
      className={`w-full min-h-[560px] border-0 bg-transparent ${className ?? ""}`}
      sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
    />
  )
}
