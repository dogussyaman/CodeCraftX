/**
 * Merges multiple JSON arrays in terimler.json into one, dedupes by term,
 * adds usage_markdown, fixes typo, adds missing terms.
 * Usage: node fix-terimler-json.mjs < terimler.json
 * Or: node fix-terimler-json.mjs (reads from ../terimler.json)
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { createInterface } from "readline"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const inputPath = join(root, "terimler.json")
const outputPath = join(root, "data", "terimler.json")

async function readInput() {
  const isStdin = process.stdin.isTTY === false
  if (isStdin) {
    const lines = []
    for await (const line of createInterface({ input: process.stdin })) lines.push(line)
    return lines.join("\n")
  }
  const argPath = process.argv[2]
  const pathsToTry = argPath ? [argPath, join(process.cwd(), argPath)] : [join(process.cwd(), "terimler.json"), inputPath]
  for (const p of pathsToTry) {
    try {
      return readFileSync(p, "utf-8")
    } catch {}
  }
  return ""
}

let raw = await readInput()
if (!raw || raw.length < 100) {
  console.error("Input too short (length:", raw?.length ?? 0, "). Run from CodeCraftX dir or pipe: Get-Content terimler.json -Raw | node scripts/fix-terimler-json.mjs")
  process.exit(1)
}
// If file has multiple arrays ( "]  [" ), merge them first
if (/\]\s*\[\s*/.test(raw)) {
  let merged = raw.replace(/\]\s*\[\s*/g, ",").trimEnd()
  if (merged.endsWith(",")) merged = merged.replace(/,\s*$/, "")
  merged = merged.replace(/,\s*\]\s*$/, "]")
  if (!merged.endsWith("]")) merged = merged + "]"
  raw = merged
}
let items
try {
  items = JSON.parse(raw)
} catch (e) {
  console.error("Parse error:", e.message)
  process.exit(1)
}
if (!Array.isArray(items)) {
  console.error("Expected array")
  process.exit(1)
}

// Dedupe by term: keep entry with longer detailed_description
const byTerm = new Map()
for (const item of items) {
  const term = item.term
  if (!term) continue
  const existing = byTerm.get(term)
  const len = (item.detailed_description || "").length + (item.example_code || "").length
  const existingLen = existing ? (existing.detailed_description || "").length + (existing.example_code || "").length : 0
  if (!existing || len >= existingLen) {
    byTerm.set(term, item)
  }
}

let terms = Array.from(byTerm.values())

// Fix typo
for (const t of terms) {
  if (t.detailed_description && t.detailed_description.includes("haldir")) {
    t.detailed_description = t.detailed_description.replace(/haldir/g, "halidir")
  }
  if (!Object.prototype.hasOwnProperty.call(t, "usage_markdown")) {
    t.usage_markdown = ""
  }
}

// Missing terms to add (plan: WebSocket, SDK, IDE, Branch, Merge, PR, Endpoint, Cookie, Session, Latency, etc.)
const existingTerms = new Set(terms.map((t) => t.term))
const missing = [
  {
    term: "WebSocket",
    category: "Ağ",
    description: "İki yönlü gerçek zamanlı iletişim protokolü.",
    detailed_description: "WebSocket, tek TCP bağlantısı üzerinden tam çift yönlü iletişim sağlar. Chat ve canlı güncellemelerde kullanılır.",
    example_usage: "Canlı bildirimler WebSocket ile gönderilir.",
    example_code: "new WebSocket('wss://...')",
    level: "intermediate",
    usage_markdown: "",
  },
  {
    term: "SDK",
    category: "Araçlar",
    description: "Yazılım geliştirme kiti.",
    detailed_description: "SDK, belirli bir platform veya API için uygulama geliştirmeyi kolaylaştıran araç ve kütüphaneleri içerir.",
    example_usage: "Android SDK ile mobil uygulama geliştirilir.",
    example_code: "import sdk from '@vendor/sdk'",
    level: "beginner",
    usage_markdown: "",
  },
  {
    term: "IDE",
    category: "Araçlar",
    description: "Entegre geliştirme ortamı.",
    detailed_description: "IDE, editör, derleyici, hata ayıklayıcı ve diğer araçları tek arayüzde sunar.",
    example_usage: "VS Code popüler bir IDE'dir.",
    example_code: "// VS Code, IntelliJ",
    level: "beginner",
    usage_markdown: "",
  },
  {
    term: "Debugging",
    category: "Genel Yazılım",
    description: "Yazılım hatalarını bulma ve düzeltme süreci.",
    detailed_description: "Debugging sırasında breakpoint, log ve adım adım çalıştırma kullanılır.",
    example_usage: "Bug debugging ile bulundu.",
    example_code: "console.log()",
    level: "beginner",
    usage_markdown: "",
  },
  {
    term: "Repository",
    category: "Versiyon Kontrol",
    description: "Kod deposu; sürüm kontrolü altındaki proje.",
    detailed_description: "Repository, Git ile yönetilen dosya ve geçmişi içerir.",
    example_usage: "GitHub'da repository oluşturuldu.",
    example_code: "git clone <url>",
    level: "beginner",
    usage_markdown: "",
  },
  {
    term: "Branch",
    category: "Versiyon Kontrol",
    description: "Kodun paralel geliştirme dalı.",
    detailed_description: "Branch sayesinde özellikler ayrı dallarda geliştirilip sonra birleştirilir.",
    example_usage: "Yeni özellik için branch açıldı.",
    example_code: "git checkout -b feature/x",
    level: "beginner",
    usage_markdown: "",
  },
  {
    term: "Merge",
    category: "Versiyon Kontrol",
    description: "İki dalın birleştirilmesi.",
    detailed_description: "Merge, bir branch'teki değişiklikleri başka bir branch'e taşır.",
    example_usage: "feature branch main'e merge edildi.",
    example_code: "git merge feature/x",
    level: "beginner",
    usage_markdown: "",
  },
  {
    term: "Pull Request",
    category: "Versiyon Kontrol",
    description: "Dal birleştirme talebi.",
    detailed_description: "Pull request, kod incelemesi ve tartışma sonrası merge için kullanılır.",
    example_usage: "Pull request açıldı ve onaylandı.",
    example_code: "PR #42",
    level: "beginner",
    usage_markdown: "",
  },
  {
    term: "Environment Variable",
    category: "Genel Yazılım",
    description: "Ortam bazlı yapılandırma değişkeni.",
    detailed_description: "Environment variable ile hassas bilgiler ve ortam ayarları kod dışında tutulur.",
    example_usage: "API anahtarı environment variable'da saklanır.",
    example_code: "process.env.API_KEY",
    level: "beginner",
    usage_markdown: "",
  },
  {
    term: "Endpoint",
    category: "API",
    description: "API'de tek bir kaynağa veya işleme karşılık gelen URL.",
    detailed_description: "Endpoint, HTTP metodu ile birlikte belirli bir işlemi tanımlar.",
    example_usage: "Kullanıcı listesi GET /api/users endpoint'inden alınır.",
    example_code: "GET /api/users",
    level: "beginner",
    usage_markdown: "",
  },
  {
    term: "Payload",
    category: "API",
    description: "İstek veya yanıt gövdesindeki veri.",
    detailed_description: "Payload, HTTP body içinde taşınan asıl veriyi ifade eder.",
    example_usage: "POST isteğinin payload'ında kullanıcı bilgileri var.",
    example_code: "JSON.stringify(body)",
    level: "beginner",
    usage_markdown: "",
  },
  {
    term: "Cookie",
    category: "Web",
    description: "Tarayıcıda sunucu tarafından saklanan küçük veri.",
    detailed_description: "Cookie, oturum ve tercih bilgilerini tarayıcıda tutar.",
    example_usage: "Giriş durumu cookie ile saklanır.",
    example_code: "Set-Cookie: session=...",
    level: "beginner",
    usage_markdown: "",
  },
  {
    term: "Session",
    category: "Güvenlik",
    description: "Kullanıcı oturumu; sunucuda tutulan oturum bilgisi.",
    detailed_description: "Session, kullanıcının kimliğini sunucu tarafında saklar.",
    example_usage: "Session timeout sonrası çıkış yapıldı.",
    example_code: "req.session",
    level: "beginner",
    usage_markdown: "",
  },
  {
    term: "Latency",
    category: "Performans",
    description: "İstek ile yanıt arasındaki gecikme süresi.",
    detailed_description: "Latency, ağ veya işlem gecikmesini ifade eder.",
    example_usage: "API latency 200ms altında tutuldu.",
    example_code: "// response time",
    level: "beginner",
    usage_markdown: "",
  },
  {
    term: "Bandwidth",
    category: "Ağ",
    description: "Veri aktarım kapasitesi.",
    detailed_description: "Bandwidth, belirli sürede aktarılabilecek veri miktarını ifade eder.",
    example_usage: "Video stream bandwidth gereksinimi yüksektir.",
    example_code: "// Mbps",
    level: "beginner",
    usage_markdown: "",
  },
]

for (const m of missing) {
  if (!existingTerms.has(m.term)) {
    terms.push(m)
    existingTerms.add(m.term)
  }
}

// Sort by term
terms.sort((a, b) => a.term.localeCompare(b.term, "tr"))

// Ensure consistent shape: usage_markdown present (empty if not set)
terms = terms.map((t) => ({
  term: t.term,
  category: t.category,
  description: t.description,
  detailed_description: t.detailed_description,
  example_usage: t.example_usage,
  example_code: t.example_code,
  level: t.level,
  usage_markdown: t.usage_markdown ?? "",
  ...(t.link && { link: t.link }),
}))

const outDir = join(root, "data")
try {
  mkdirSync(outDir, { recursive: true })
} catch (_) {}
writeFileSync(outputPath, JSON.stringify(terms, null, 2), "utf-8")
console.log("Wrote", terms.length, "terms to", outputPath)
