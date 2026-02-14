-- Seed: Örnek bülten kampanyaları
-- Bu script, admin panelindeki "Bülten" bölümüne 5 adet örnek taslak ekler.
-- Supabase SQL Editor'da veya migration akışınızda tek seferlik çalıştırabilirsiniz.

-- 1) Yeni fiyatlandırma sayfamız yayında
INSERT INTO public.newsletter_campaigns (title, image_url, body_html, links, created_by)
SELECT
  'Yeni fiyatlandırma sayfamız yayında!',
  'https://cdn.example.com/newsletters/pricing-launch.png',
  '<h1>Yeni fiyatlandırma sayfamız yayında!</h1>
<p>Merhaba 👋</p>
<p>CodeCraftX olarak, hem bireysel geliştiriciler hem de şirketler için daha anlaşılır ve adil bir fiyatlandırma yapısı hazırladık.</p>
<ul>
  <li><strong>Free</strong>: Küçük projeler ve denemeler için tamamen ücretsiz.</li>
  <li><strong>Orta</strong>: Büyüyen ekipler için daha fazla ilan ve gelişmiş özellikler.</li>
  <li><strong>Premium</strong>: Büyük kurumlar için sınırsız ilan ve kurumsal seviye destek.</li>
</ul>
<p>Yeni sayfada her planın detaylarını, aylık ve yıllık ücretleri ve hangi özelliklerin dahil olduğunu tek bakışta görebilirsiniz.</p>
<p>Sevgiler,<br />CodeCraftX Ekibi</p>',
  '[{"text":"Fiyatlandırma sayfasını incele","url":"https://codecraftx.com/ucretlendirme"},{"text":"Plan özellikleri karşılaştırması","url":"https://codecraftx.com/ucretlendirme#plan-karsilastirma"}]'::jsonb,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.newsletter_campaigns WHERE title = 'Yeni fiyatlandırma sayfamız yayında!'
);

-- 2) Yıllık ödeme %20 indirim
INSERT INTO public.newsletter_campaigns (title, image_url, body_html, links, created_by)
SELECT
  'Yıllık ödemede %20 indirim fırsatı',
  'https://cdn.example.com/newsletters/annual-discount.png',
  '<h1>Yıllık ödemede %20 indirim!</h1>
<p>Merhaba,</p>
<p>CodeCraftX i düzenli olarak kullanan ekipler için yıllık ödeme seçeneğinde yüzde yirmi indirim başlattık.</p>
<ul>
  <li>Orta plan: Aylık yerine yıllık ödeme seçildiğinde toplam maliyet düşer.</li>
  <li>Premium plan: Büyük ekipler için ciddi bütçe avantajı sağlar.</li>
</ul>
<p>Fiyatlandırma sayfasında aylık ve yıllık seçenekleri arasında geçiş yaparak gerçek zamanlı fiyat karşılaştırmasını görebilirsiniz.</p>
<p>Kampanya süresi sınırlıdır. Fırsatı kaçırmamak için hesabınıza giriş yapıp planınızı yıllığa çevirebilirsiniz.</p>
<p>İyi çalışmalar,<br />CodeCraftX Ekibi</p>',
  '[{"text":"Yıllık fiyatları gör","url":"https://codecraftx.com/ucretlendirme?billing=annually"},{"text":"Hesabımdan planı değiştir","url":"https://codecraftx.com/dashboard/company/plan"}]'::jsonb,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.newsletter_campaigns WHERE title = 'Yıllık ödemede %20 indirim fırsatı'
);

-- 3) Free plandan Orta plana geçiş rehberi
INSERT INTO public.newsletter_campaigns (title, image_url, body_html, links, created_by)
SELECT
  'Free plandan Orta plana geçiş rehberi',
  'https://cdn.example.com/newsletters/upgrade-guide.png',
  '<h1>Free plandan Orta plana geçiş rehberi</h1>
<p>Selam 👋</p>
<p>Free plan ile güzel bir başlangıç yaptınız. Daha fazla ilan, gelişmiş analitik ve öncelikli destekten yararlanmak için Orta plana geçişi düşünüyorsanız, sizin için kısa bir rehber hazırladık.</p>
<ol>
  <li>Hesabınıza giriş yapın.</li>
  <li>Şirket ayarları ve abonelik sayfasına gidin.</li>
  <li>Planı yükselt butonuna tıklayın ve Orta planı seçin.</li>
</ol>
<p>Geçiş işlemi sırasında tüm ilanlarınız ve aday verileriniz korunur, sadece plan limitleriniz ve haklarınız genişletilir.</p>
<p>Sevgiler,<br />CodeCraftX Ekibi</p>',
  '[{"text":"Plan yükselt sayfası","url":"https://codecraftx.com/dashboard/company/plan"},{"text":"Orta plan detayları","url":"https://codecraftx.com/ucretlendirme#orta"}]'::jsonb,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.newsletter_campaigns WHERE title = 'Free plandan Orta plana geçiş rehberi'
);

-- 4) Premium plana özel avantajlar
INSERT INTO public.newsletter_campaigns (title, image_url, body_html, links, created_by)
SELECT
  'Premium plana geçen şirketlere özel avantajlar',
  'https://cdn.example.com/newsletters/premium-benefits.png',
  '<h1>Premium plana geçen şirketlere özel avantajlar</h1>
<p>Merhaba,</p>
<p>Kurumsal müşterilerimiz için tasarladığımız Premium plan, işe alım süreçlerinizi uçtan uca yönetebilmeniz için gelişmiş özellikler sunar.</p>
<ul>
  <li>Sınırsız ilan yayını</li>
  <li>Sınırsız insan kaynakları kullanıcısı ekleme</li>
  <li>Yedi gün yirmi dört saat öncelikli destek</li>
  <li>API erişimi ve entegrasyon imkanı</li>
  <li>White label ve marka özelleştirme seçenekleri</li>
</ul>
<p>Fiyatlandırma sayfasından Premium plan ücretlerini ve örnek maliyet hesaplarını inceleyebilirsiniz.</p>
<p>Saygılarımızla,<br />CodeCraftX Ekibi</p>',
  '[{"text":"Premium plan fiyatları","url":"https://codecraftx.com/ucretlendirme#premium"},{"text":"Satış ekibiyle iletişime geç","url":"mailto:sales@codecraftx.com"}]'::jsonb,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.newsletter_campaigns WHERE title = 'Premium plana geçen şirketlere özel avantajlar'
);

-- 5) Fiyat güncellemesi bilgilendirmesi
INSERT INTO public.newsletter_campaigns (title, image_url, body_html, links, created_by)
SELECT
  'Fiyat güncellemesi hakkında önemli duyuru',
  'https://cdn.example.com/newsletters/pricing-update.png',
  '<h1>Fiyat güncellemesi hakkında önemli duyuru</h1>
<p>Merhaba,</p>
<p>CodeCraftX platformunda sunduğumuz yeni özellikler ve altyapı maliyetleri doğrultusunda fiyatlarımızı güncelliyoruz.</p>
<p>Yeni fiyatlar 1 Nisan 2026 tarihinden itibaren geçerli olacaktır. Mevcut kullanıcılarımız için ise, güncelleme tarihine kadar planlarını yenilemeleri halinde eski fiyatlar korunur.</p>
<ul>
  <li>Free plan: Ücretsiz olarak devam eder.</li>
  <li>Orta plan: Küçük bir artış ile yeni özellikler sunar.</li>
  <li>Premium plan: Kurumsal ihtiyaçlara göre yeniden düzenlenmiştir.</li>
</ul>
<p>Detaylı karşılaştırma ve yeni fiyat tablosunu fiyatlandırma sayfamızda bulabilirsiniz.</p>
<p>Sevgiler,<br />CodeCraftX Ekibi</p>',
  '[{"text":"Yeni fiyat tablosunu gör","url":"https://codecraftx.com/ucretlendirme?source=newsletter-pricing-update"},{"text":"Destek ile iletişime geç","url":"https://codecraftx.com/destek"}]'::jsonb,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.newsletter_campaigns WHERE title = 'Fiyat güncellemesi hakkında önemli duyuru'
);

