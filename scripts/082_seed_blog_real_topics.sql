-- ============================================
-- 082: Gerçek konularda blog yazıları (yazılım, AI, Cursor, vb.)
-- CodeCrafters - 079_blog_tables.sql ve en az bir profil gerekir.
-- Kapak görseli için cover_image_url sütunu yoksa aşağıdaki ALTER ile eklenir.
-- ============================================

ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

INSERT INTO public.blog_posts (title, slug, body, cover_image_url, author_id, status, published_at)
SELECT v.title, v.slug, v.body, v.cover_image_url, (SELECT id FROM public.profiles LIMIT 1), 'published', v.published_at
FROM (VALUES
  (
    'Yapay Zeka ile Yazılım Geliştirme: 2024''te Neler Değişti?',
    'yapay-zeka-ile-yazilim-gelistirme-2024',
    'ChatGPT, Claude, GitHub Copilot ve Cursor gibi araçlar yazılım geliştirme sürecini kökten değiştirdi. Artık sadece kod tamamlama değil; hata ayıklama, test yazımı ve hatta mimari kararlar AI asistanlarıyla birlikte alınıyor. Bu değişim 2024''te hız kazandı: modeller daha hızlı, daha bağlama duyarlı ve editörlere daha sıkı entegre hale geldi.

Bu yazıda, AI destekli geliştirme araçlarının gerçek projelerde nasıl kullanıldığını ve verimliliği nasıl artırdığını inceliyoruz. Hangi senaryolarda insan kararı şart, hangi işleri AI''ya güvenle bırakabileceğinizi özetliyoruz. Ayrıca kod kalitesi, gizlilik ve maliyet dengesi gibi pratik konulara da değiniyoruz.

Sonuç olarak, 2024''te yazılım geliştirme "AI ile birlikte çalışma" modeline doğru evriliyor. Bu dönüşümü doğru okuyan ekipler hem hız hem kalite kazanıyor.',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    NOW() - INTERVAL '12 days'
  ),
  (
    'Cursor IDE: AI-First Kod Editörü Ne Sunuyor?',
    'cursor-ide-ai-first-kod-editoru',
    'Cursor, VS Code tabanlı ve yapay zeka ile baştan sona entegre bir editör. Sadece bir eklenti değil; tüm deneyim AI ile tasarlandı. Inline edit (seçtiğiniz kodu doğal dille değiştirme), chat ile kod değişikliği, @docs ile dokümantasyon referansı ve agent modu gibi özelliklerle gerçek bir "AI pair programmer" deneyimi sunuyor.

Bu yazıda Cursor''ın 2024 yeniliklerini, klavye kısayollarını ve en verimli kullanım ipuçlarını paylaşıyoruz. Özellikle büyük codebase''lerde arama, refactoring ve yeni özellik ekleme senaryolarında Cursor''ı nasıl kullanacağınızı adım adım anlatıyoruz.

Cursor, OpenAI ve Claude modellerini destekliyor; abonelik modeli ve gizlilik ayarları da yazıda ele alınıyor. VS Code''dan geçiş yapanlar için uyum rehberi de bulacaksınız.',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    NOW() - INTERVAL '11 days'
  ),
  (
    'GitHub Copilot ve Copilot Chat: Gerçek Dünya Deneyimleri',
    'github-copilot-gercek-dunya-deneyimleri',
    'GitHub Copilot artık milyonlarca geliştirici tarafından kullanılıyor. Kod önerileri, test yazımı ve açıklama üretimi günlük akışın parçası haline geldi. Copilot Chat ile doğal dilde soru sorup kod blokları alabiliyor; terminal komutları ve PR açıklamaları üretebiliyorsunuz.

Bu yazıda, farklı dil ve framework''lerde (JavaScript, TypeScript, Python, Go vb.) Copilot kullanımını, avantajları ve sınırları anlatıyoruz. Abonelik modelleri (Bireysel, Business, Enterprise) ve alternatifler (Cursor, Codeium) ile kısa bir karşılaştırma da yapıyoruz.

Gerçek proje deneyimlerine dayanarak hangi tür görevlerde Copilot''un en çok zaman kazandırdığını ve hangi durumlarda dikkatli olmanız gerektiğini paylaşıyoruz.',
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    NOW() - INTERVAL '10 days'
  ),
  (
    'Claude, GPT-4 ve Cursor: Hangi Araç Ne Zaman?',
    'claude-gpt4-cursor-hangi-arac-ne-zaman',
    'Claude (Anthropic), ChatGPT / GPT-4 (OpenAI) ve Cursor farklı güçlü yanlara sahip. Cursor doğrudan editör içinde çalıştığı için "şu dosyayı değiştir" tarzı işlerde çok hızlı. Claude ve GPT ise genel sohbet, tasarım tartışması ve uzun metin üretimi için ideal.

Bu yazıda üçlüyü kullanım senaryolarına göre karşılaştırıyoruz: hızlı patch, büyük refactoring, dokümantasyon yazımı, kod incelemesi ve yeni teknoloji öğrenme. Hangisini günlük akışta öne çıkaracağınızı seçmenize yardımcı olacak pratik bir rehber sunuyoruz.

Fiyat, token limiti ve gizlilik politikalarına da kısaca değinerek hangi senaryoda hangi kombinasyonun mantıklı olduğunu özetliyoruz.',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    NOW() - INTERVAL '9 days'
  ),
  (
    'TypeScript 5.x: 2024''te Gelen Yenilikler',
    'typescript-5x-2024-yenilikler',
    'TypeScript 5.x ile gelen const type parameters, decorator''ların standartlaşması, geliştirilmiş inference ve performans iyileştirmeleri modern JavaScript/TS projelerini doğrudan etkiliyor. Özellikle büyük codebase''lerde tip güvenliği ve IDE deneyimi belirgin şekilde iyileşti.

Bu yazıda TypeScript 5.4 ve 5.5 ile gelen özellikleri tek tek ele alıyoruz. NoInfer, tüm enum''lar için const, ve import attributes gibi yeniliklerin günlük kodda nasıl kullanılacağını örneklerle gösteriyoruz. Migration ipuçları ve büyük projelerde güvenli güncelleme stratejisi de paylaşılıyor.

Sonuç olarak TypeScript 5.x, hem performans hem dil özellikleri açısından 2024''te sağlam bir tercih olmaya devam ediyor.',
    'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=800&q=80',
    NOW() - INTERVAL '8 days'
  ),
  (
    'VS Code 2024: Yeni Özellikler ve AI Entegrasyonları',
    'vs-code-2024-yeni-ozellikler-ai',
    'Visual Studio Code 2024 sürümleriyle birlikte daha iyi performans, yeni tema ve erişilebilirlik iyileştirmeleri geldi. AI eklentileri (Copilot, Cursor, Codeium vb.) ile entegrasyon da artık standart bir beklenti haline geldi.

Bu yazıda VS Code''un son güncellemelerini, önerilen eklentileri ve AI araçlarıyla birlikte kullanımını inceliyoruz. Workspace Trust, Profile''lar ve Remote Development gibi özelliklerin günlük kullanımda nasıl işinize yarayacağını anlatıyoruz.

VS Code mu hızlı, Cursor mu daha verimli sorusuna da kısa bir cevap veriyoruz: İkisi de farklı ihtiyaçlara hitap ediyor; birlikte kullanım senaryoları da mümkün.',
    'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&q=80',
    NOW() - INTERVAL '7 days'
  ),
  (
    'Next.js 15 ve React Server Components',
    'nextjs-15-react-server-components',
    'Next.js 15, React Server Components (RSC) ve Server Actions ile full-stack React deneyimini bir adım öteye taşıdı. App Router artık olgunlaştı; caching davranışı ve streaming ile performans ve geliştirici deneyimi iyileşti.

Bu yazıda App Router, caching (fetch, route segment, React cache), streaming ve RSC''nin ne zaman kullanılacağı, ne zaman client component''e geçileceği gibi pratik konuları ele alıyoruz. "use client" kullanımı ve state yönetimi için öneriler de paylaşılıyor.

Mevcut bir Next 13/14 projesini 15''e taşırken dikkat edilmesi gerekenler ve yaygın tuzaklar da özetleniyor. Sonuç olarak Next.js 15, production için güvenle tercih edilebilir bir sürüm.',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    NOW() - INTERVAL '6 days'
  ),
  (
    'LLM''ler Yazılım Dünyasını Nasıl Değiştiriyor?',
    'llmler-yazilim-dunyasini-nasil-degistiriyor',
    'Büyük dil modelleri (LLM) sadece kod üretmekle kalmıyor; dokümantasyon, test, kod incelemesi ve hatta proje planlaması alanlarında da kullanılıyor. Bu dönüşüm hem fırsat hem risk barındırıyor: verimlilik artıyor ama kalite, güvenlik ve etik sorular da gündemde.

Bu yazıda LLM''lerin yazılım süreçlerine etkisini, etik ve güvenlik tartışmalarını özetliyoruz. Açık kaynak vs kapalı modeller, veri gizliliği ve "AI-native" ekiplerin gelecekte nasıl çalışacağına dair görüşlere yer veriyoruz.

Sonuç olarak LLM''ler bir "yardımcı" olarak kalacak; kritik kararlar ve mimari hâlâ insanın sorumluluğunda. Doğru kullanımı öğrenen ekipler ise hem hız hem kalite kazanmaya devam edecek.',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    NOW() - INTERVAL '5 days'
  ),
  (
    'AI Pair Programming Araçları: Cursor, Copilot, Codeium Karşılaştırması',
    'ai-pair-programming-araclari-karsilastirma',
    'Cursor, GitHub Copilot ve Codeium gibi araçlar "AI pair programming" vaat ediyor. Hepsi de kod önerisi ve chat sunuyor; farklar fiyat, entegrasyon derinliği, dil desteği ve gizlilik politikalarında ortaya çıkıyor.

Bu yazıda üçünü fiyat, entegrasyon, dil desteği, gizlilik ve günlük kullanım deneyimi açısından karşılaştırıyoruz. Hangi proje tipinde (kişisel, startup, kurumsal) hangi aracın daha verimli olduğunu ve bütçe sınırına göre seçim yapmanızı kolaylaştıracak bir özet sunuyoruz.

Ücretsiz katmanları ve deneme sürelerini de not ediyoruz; böylece kendi deneyiminize göre karar verebilirsiniz.',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    NOW() - INTERVAL '4 days'
  ),
  (
    'Supabase ve Postgres: 2024''te Backend Geliştirme',
    'supabase-postgres-2024-backend',
    'Supabase, açık kaynak Firebase alternatifi olarak Postgres tabanlı backend, auth, realtime ve storage sunuyor. 2024''te Edge Functions, daha iyi RLS (Row Level Security) dokümantasyonu ve framework entegrasyonları ile güçlendi.

Bu yazıda Supabase''in 2024 güncellemelerini, Edge Functions ile serverless API yazımını, RLS ile güvenli API tasarımını ve Next.js / React ile entegrasyonu ele alıyoruz. Hızlı MVP ve production için pratik ipuçları paylaşılıyor.

Sonuç olarak Supabase, özellikle React/Next.js kullanan ekipler için hâlâ güçlü bir tercih. Postgres bilgisi olanlar RLS ve SQL ile tam kontrol elde edebiliyor.',
    'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
    NOW() - INTERVAL '3 days'
  )
) AS v(title, slug, body, cover_image_url, published_at)
ON CONFLICT (slug) DO NOTHING;
