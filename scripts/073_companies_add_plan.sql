-- ============================================
-- 073: companies tablosuna plan sütunu ekleme
-- Free / Orta / Premium paketleri için; varsayılan free.
-- Supabase SQL Editor'da çalıştırın.
-- ============================================

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'orta', 'premium'));

COMMENT ON COLUMN public.companies.plan IS 'Şirket abonelik planı: free (5 ilan), orta (100 ilan), premium (sınırsız)';
