-- ============================================
-- Profil avatars + kapak fotoğrafı eklemeleri
-- Mevcut yapıyı bozmadan çalıştırılacak ek SQL.
-- Supabase SQL Editor'da bu dosyayı ayrıca çalıştırın.
-- ============================================

-- 1. profiles tablosuna kapak fotoğrafı sütunu (yoksa ekler)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_bg_url TEXT;

-- 2. avatars bucket (profil + kapak fotoğrafları)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "avatars public read" ON storage.objects;
CREATE POLICY "avatars public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars insert own folder" ON storage.objects;
CREATE POLICY "avatars insert own folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars update own" ON storage.objects;
CREATE POLICY "avatars update own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatars delete own" ON storage.objects;
CREATE POLICY "avatars delete own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================
-- TAMAMLANDI
-- ============================================
