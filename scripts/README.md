# Supabase migration scripts

SQL scripts are intended to be run in **Supabase Dashboard → SQL Editor** in order.

## Blog view count (görüntülenme sayısı)

For blog view counting to work, run in this order:

1. **04_blog_stats.sql** – adds `view_count` and `like_count` to `blog_posts`
2. **06_increment_blog_post_view.sql** – creates RPC `increment_blog_post_view`

Running 06 without 04 will cause "column view_count does not exist" when the RPC runs.

## ATS (Applicant Tracking System) scripts

### Toplu ATS skorlama (`ats-recalculate-all.mjs`)

Tüm iş ilanları için ATS skorlarını yeniler. Uygulama çalışır durumda olmalı (dev veya production).

**Ön koşul:** `.env.local` içinde `CRON_SECRET` veya `ADMIN_SECRET` tanımlı olmalı.

**Kullanım:**

```bash
node scripts/ats-recalculate-all.mjs
```

İsteğe bağlı farklı base URL:

```bash
node scripts/ats-recalculate-all.mjs --url https://yourapp.com
```

Arka planda `POST /api/ats/recalculate-all` çağrılır (Bearer token ile korunur).
