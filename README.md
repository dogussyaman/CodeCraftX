<p align="center">
  <img src="public/logo.svg" alt="CodeCrafters" width="96" height="96" />
</p>

<h1 align="center">CodeCrafters</h1>
<p align="center">
  Geliştiriciler ve işverenler için modern işe alım ve destek platformu.
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind" /></a>
</p>

---

## Özellikler

| Alan | Açıklama |
|------|----------|
| **Kimlik** | Supabase Auth ile giriş, kayıt ve OAuth (Google vb.) |
| **Roller** | Geliştirici, İK, Şirket, Platform Admin — rol bazlı dashboard |
| **Destek** | Canlı destek sohbeti, destek talepleri |
| **Arayüz** | shadcn/ui, Tailwind, karanlık mod, mobil uyumlu |
| **Formlar** | Zod + React Hook Form ile doğrulama |

---

## Hızlı Başlangıç

```bash
git clone <repo-url>
cd CodeCrafters
npm install
cp .env.example .env.local   # Supabase URL ve anon key'i doldur
npm run dev
```

Tarayıcıda **http://localhost:3000** açın.

### Ortam Değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Opsiyonel; şirket/HR API ve cron için sunucu tarafında |

---

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu (http://localhost:3000) |
| `npm run build` | Prodüksiyon build |
| `npm run start` | Prodüksiyon sunucusu |
| `npm run lint` | ESLint kontrolü |

---

## Proje Yapısı

```
CodeCrafters/
├── app/
│   ├── (main)/          # Ana sayfa, landing
│   ├── auth/            # Giriş, kayıt, şifre sıfırlama
│   ├── dashboard/       # Rol bazlı dashboard (gelistirici, ik, company, admin)
│   └── api/             # API routes
├── components/          # UI bileşenleri (chat, sidebar, header, vb.)
├── lib/                 # Supabase client, utils, types
├── hooks/               # useAuth, useChat, useNotifications, vb.
├── public/              # Statik dosyalar
└── scripts/             # Supabase SQL migration / RLS scriptleri
```

---

## Teknoloji

- **Framework:** Next.js 16 (App Router, Server Actions)
- **Dil:** TypeScript
- **Styling:** Tailwind CSS
- **UI:** shadcn/ui (Radix tabanlı)
- **Backend / Auth / DB:** Supabase
- **Form:** React Hook Form + Zod

---

## Lisans

[MIT](LICENSE)
