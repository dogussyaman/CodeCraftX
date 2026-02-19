#!/usr/bin/env node
/**
 * Tüm ilanlar için ATS skorlarını yeniler (toplu skorlama).
 * Ön koşul: .env.local içinde CRON_SECRET veya ADMIN_SECRET ve NEXT_PUBLIC_APP_URL (veya varsayılan http://localhost:3000).
 *
 * Kullanım:
 *   node scripts/ats-recalculate-all.mjs
 *   node scripts/ats-recalculate-all.mjs --url https://yourapp.com
 *
 * Uygulama çalışır durumda olmalı (dev veya production).
 */

import { readFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, "..")

function loadEnvLocal() {
  const path = resolve(root, ".env.local")
  if (!existsSync(path)) {
    console.warn("⚠ .env.local bulunamadı, mevcut process.env kullanılıyor.")
    return
  }
  const content = readFileSync(path, "utf8")
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1).replace(/\\"/g, '"')
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1).replace(/\\'/g, "'")
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvLocal()

const secret = process.env.CRON_SECRET || process.env.ADMIN_SECRET
const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "http://localhost:3000"

async function main() {
  if (!secret) {
    console.error("Hata: CRON_SECRET veya ADMIN_SECRET .env.local içinde tanımlı olmalı.")
    process.exit(1)
  }

  const url = process.argv.includes("--url")
    ? process.argv[process.argv.indexOf("--url") + 1]
    : baseUrl
  const endpoint = `${url.replace(/\/$/, "")}/api/ats/recalculate-all`

  console.log("ATS toplu skorlama başlatılıyor:", endpoint)
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({}),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error("İstek başarısız:", res.status, data.error || data)
    process.exit(1)
  }
  if (!data.success) {
    console.error("API hata döndü:", data.error)
    process.exit(1)
  }

  console.log("Tamamlandı. İşlenen ilan sayısı:", data.data?.total_jobs ?? 0)
  if (data.data?.results?.length) {
    data.data.results.forEach((r) => {
      console.log(`  - ${r.jobId}: ${r.processed} skor, ${r.errors} hata`)
    })
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
