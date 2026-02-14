# PLANCODEX

## Öncelikli Hatalar
- **supabase/functions/cv-process/index.ts**: CV metni çıkarımı henüz uygulanmıyor; gerçek PDF/DOCX ayrıştırma servisi/kütüphanesi eklenmeli ve `raw_text` yoksa otomatik çıkarım yapılmalı.
- **app/api/newsletter/send/route.ts**: Bülten gönderimi sadece `sent_at` güncelliyor; gerçek e‑posta kuyruğa alma ve gönderim akışı tamamlanmalı.

## Güvenlik Riskleri
- **app/dashboard/gelistirici/cv/yukle/page.tsx**: CV dosyaları public URL ile saklanıyor; private bucket + signed URL veya erişim politikasıyla dosya gizliliği sağlanmalı.
- **supabase/functions/cv-process/index.ts**: API anahtarının kısmi loglanması gereksiz bilgi sızıntısı yaratabilir; loglar kaldırılmalı veya güvenli log seviyesine çekilmeli.

## Kalite/UX İyileştirmeleri
- **app/dashboard/admin/yetenekler/skills-manager.tsx**: Hata bildirimleri `alert` ile yapılıyor; kullanıcı deneyimi için toast bildirimi ile tutarlı geri bildirim sağlanmalı.
- **app/dashboard/gelistirici/cv/yukle/page.tsx**: Yükleme sonrası Edge Function hataları sessiz geçiliyor; kullanıcıya durum ve tekrar deneme seçenekleri eklenmeli.

## Teknik Borç
- **supabase/functions/cv-process/index.ts**: Mock veri kullanımı ve OpenAI çağrısı için geçici bayrak mevcut; kota sorunu giderilince gerçek akışa geçilecek şekilde yapı sadeleştirilmeli.
- **app/api/newsletter/send/route.ts**: Bülten gönderimi için kuyruk/scheduler entegrasyonu (Resend/SMTP/Edge Function) eklenmeli.

## Zaman Tahmini
- **CV metin çıkarımı (supabase/functions/cv-process/index.ts)**: 2–3 gün (kütüphane/servis seçimi, entegrasyon, testler).
- **Bülten gönderim kuyruğu (app/api/newsletter/send/route.ts)**: 1–2 gün (kuyruk, gönderim şablonu, izleme).
- **CV dosyası erişim güvenliği (app/dashboard/gelistirici/cv/yukle/page.tsx)**: 0.5–1 gün (private bucket + signed URL).
- **Log hijyeni (supabase/functions/cv-process/index.ts)**: 0.5 gün (logların kaldırılması/standardizasyonu).
- **UI hata bildirimleri (app/dashboard/admin/yetenekler/skills-manager.tsx)**: 0.5 gün (toast entegrasyonu).
