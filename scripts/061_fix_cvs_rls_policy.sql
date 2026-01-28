-- ============================================
-- CVs Tablosu RLS Policy Düzeltmesi
-- ============================================
-- Bu script, CV ekleme hatasını düzeltmek için RLS policy'lerini yeniden oluşturur

-- Mevcut policy'leri sil
DROP POLICY IF EXISTS "Kullanıcılar kendi CV'lerini görebilir" ON public.cvs;
DROP POLICY IF EXISTS "Geliştiriciler CV yükleyebilir" ON public.cvs;
DROP POLICY IF EXISTS "Geliştiriciler kendi CV'lerini güncelleyebilir" ON public.cvs;
DROP POLICY IF EXISTS "Geliştiriciler kendi CV'lerini silebilir" ON public.cvs;

-- RLS'i etkinleştir
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;

-- SELECT Policy: Kullanıcılar kendi CV'lerini görebilir
CREATE POLICY "Kullanıcılar kendi CV'lerini görebilir" 
  ON public.cvs 
  FOR SELECT 
  USING (developer_id = auth.uid());

-- INSERT Policy: Geliştiriciler CV yükleyebilir
CREATE POLICY "Geliştiriciler CV yükleyebilir" 
  ON public.cvs 
  FOR INSERT 
  WITH CHECK (developer_id = auth.uid());

-- UPDATE Policy: Geliştiriciler kendi CV'lerini güncelleyebilir
CREATE POLICY "Geliştiriciler kendi CV'lerini güncelleyebilir" 
  ON public.cvs 
  FOR UPDATE 
  USING (developer_id = auth.uid());

-- DELETE Policy: Geliştiriciler kendi CV'lerini silebilir
CREATE POLICY "Geliştiriciler kendi CV'lerini silebilir" 
  ON public.cvs 
  FOR DELETE 
  USING (developer_id = auth.uid());

-- ============================================
-- TAMAMLANDI
-- ============================================
