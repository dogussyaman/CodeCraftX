-- ============================================
-- CodeCraftX: Başvuru, Görüşme, Geri Bildirim Kalıpları
-- cv_downloads, interviews alanları, feedback_templates, RLS
-- 00_FINAL_ALL_IN_ONE.sql sonrası çalıştırın.
-- ============================================

-- cv_downloads: CV indirme kaydı (bildirim tetiklemek için)
CREATE TABLE IF NOT EXISTS public.cv_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  downloaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cv_downloads_application ON public.cv_downloads(application_id);
CREATE INDEX IF NOT EXISTS idx_cv_downloads_downloaded_by ON public.cv_downloads(downloaded_by);

ALTER TABLE public.cv_downloads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Şirket/İK cv_downloads görebilir" ON public.cv_downloads;
CREATE POLICY "Şirket/İK cv_downloads görebilir" ON public.cv_downloads FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.job_postings jp ON jp.id = a.job_id
    WHERE a.id = cv_downloads.application_id
    AND (jp.company_id IN (
      SELECT c.id FROM public.companies c
      WHERE c.owner_profile_id = auth.uid() OR c.created_by = auth.uid()
    ) OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.company_id = jp.company_id))
  ) OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'platform_admin'))
);
DROP POLICY IF EXISTS "Şirket/İK cv indirme kaydı ekleyebilir" ON public.cv_downloads;
CREATE POLICY "Şirket/İK cv indirme kaydı ekleyebilir" ON public.cv_downloads FOR INSERT WITH CHECK (
  downloaded_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.job_postings jp ON jp.id = a.job_id
    WHERE a.id = application_id
    AND (jp.company_id IN (
      SELECT c.id FROM public.companies c
      WHERE c.owner_profile_id = auth.uid() OR c.created_by = auth.uid()
    ) OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.company_id = jp.company_id))
  )
);

-- interviews: Meet link ve aday slot onayı alanları
ALTER TABLE public.interviews
  ADD COLUMN IF NOT EXISTS meet_link TEXT,
  ADD COLUMN IF NOT EXISTS proposed_date DATE,
  ADD COLUMN IF NOT EXISTS proposed_time_slots JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS developer_selected_slot TEXT,
  ADD COLUMN IF NOT EXISTS developer_confirmed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_interviews_proposed_date ON public.interviews(proposed_date) WHERE proposed_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON public.interviews(scheduled_at);

-- İlgili kullanıcılar interview ekleyebilir/güncelleyebilir (şirket/İK)
DROP POLICY IF EXISTS "İlgili kullanıcılar mülakat ekleyebilir" ON public.interviews;
DROP POLICY IF EXISTS "İlgili kullanıcılar mülakat güncelleyebilir" ON public.interviews;
CREATE POLICY "İlgili kullanıcılar mülakat ekleyebilir" ON public.interviews FOR INSERT WITH CHECK (
  scheduled_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.job_postings jp ON jp.id = a.job_id
    WHERE a.id = application_id
    AND (jp.company_id IN (SELECT c.id FROM public.companies c WHERE c.owner_profile_id = auth.uid() OR c.created_by = auth.uid())
         OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.company_id = jp.company_id))
  )
);
CREATE POLICY "İlgili kullanıcılar mülakat güncelleyebilir" ON public.interviews FOR UPDATE USING (true);

-- feedback_templates: Hazır geri bildirim kalıpları (sistem + şirket)
CREATE TABLE IF NOT EXISTS public.feedback_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reject', 'interview', 'offer', 'general')),
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_templates_company ON public.feedback_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_feedback_templates_type ON public.feedback_templates(type);

ALTER TABLE public.feedback_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Sistem kalıpları ve kendi şirket kalıpları görülebilir" ON public.feedback_templates;
CREATE POLICY "Sistem kalıpları ve kendi şirket kalıpları görülebilir" ON public.feedback_templates FOR SELECT USING (
  is_system = TRUE
  OR (company_id IS NOT NULL AND (
    company_id IN (SELECT c.id FROM public.companies c WHERE c.owner_profile_id = auth.uid() OR c.created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.company_id = feedback_templates.company_id))
  )
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'platform_admin'))
);
DROP POLICY IF EXISTS "Şirket kendi kalıbını ekleyebilir" ON public.feedback_templates;
CREATE POLICY "Şirket kendi kalıbını ekleyebilir" ON public.feedback_templates FOR INSERT WITH CHECK (
  is_system = FALSE
  AND company_id IS NOT NULL
  AND (company_id IN (SELECT c.id FROM public.companies c WHERE c.owner_profile_id = auth.uid() OR c.created_by = auth.uid())
       OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.company_id = feedback_templates.company_id))
);
DROP POLICY IF EXISTS "Şirket kendi kalıbını güncelleyebilir" ON public.feedback_templates;
CREATE POLICY "Şirket kendi kalıbını güncelleyebilir" ON public.feedback_templates FOR UPDATE USING (
  is_system = FALSE AND company_id IS NOT NULL
  AND (company_id IN (SELECT c.id FROM public.companies c WHERE c.owner_profile_id = auth.uid() OR c.created_by = auth.uid())
       OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.company_id = feedback_templates.company_id))
);
DROP POLICY IF EXISTS "Şirket kendi kalıbını silebilir" ON public.feedback_templates;
CREATE POLICY "Şirket kendi kalıbını silebilir" ON public.feedback_templates FOR DELETE USING (
  is_system = FALSE AND company_id IS NOT NULL
  AND (company_id IN (SELECT c.id FROM public.companies c WHERE c.owner_profile_id = auth.uid() OR c.created_by = auth.uid())
       OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.company_id = feedback_templates.company_id))
);

DROP TRIGGER IF EXISTS set_updated_at_feedback_templates ON public.feedback_templates;
CREATE TRIGGER set_updated_at_feedback_templates
  BEFORE UPDATE ON public.feedback_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Sistem kalıpları (seed) - sadece henüz yoksa ekle
INSERT INTO public.feedback_templates (company_id, title, body, type, is_system)
SELECT NULL, 'Pozisyona uygun değil', 'Başvurunuzu değerlendirdik. Bu pozisyon için uygun bulunmadığınızı üzülerek bildiririz. İlginiz için teşekkür ederiz.', 'reject', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.feedback_templates WHERE is_system = TRUE AND type = 'reject' AND title = 'Pozisyona uygun değil' LIMIT 1);
INSERT INTO public.feedback_templates (company_id, title, body, type, is_system)
SELECT NULL, 'Deneyim uyumsuzluğu', 'Pozisyonumuz için gerekli deneyim seviyesi ile başvurunuz örtüşmemektedir. İleride uygun pozisyonlar için sizi değerlendireceğiz.', 'reject', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.feedback_templates WHERE is_system = TRUE AND type = 'reject' AND title = 'Deneyim uyumsuzluğu' LIMIT 1);
INSERT INTO public.feedback_templates (company_id, title, body, type, is_system)
SELECT NULL, 'Görüşme daveti', 'Başvurunuzu olumlu değerlendirdik. Sizinle bir görüşme planlamak istiyoruz. Uygun tarih ve saatinizi bildirmenizi rica ederiz.', 'interview', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.feedback_templates WHERE is_system = TRUE AND type = 'interview' LIMIT 1);
INSERT INTO public.feedback_templates (company_id, title, body, type, is_system)
SELECT NULL, 'Teklif hazırlanıyor', 'Görüşmelerimiz sonucunda sizinle çalışmak istiyoruz. En kısa sürede teklifimizi ileteceğiz.', 'offer', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.feedback_templates WHERE is_system = TRUE AND type = 'offer' LIMIT 1);
INSERT INTO public.feedback_templates (company_id, title, body, type, is_system)
SELECT NULL, 'Genel bilgilendirme', 'Başvurunuz alınmıştır. Değerlendirme sürecinde sizinle iletişime geçeceğiz.', 'general', TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.feedback_templates WHERE is_system = TRUE AND type = 'general' LIMIT 1);

-- application_assignments: HR'ın başvuru üstlenmesi için INSERT policy (company_admin da ilan sahibi olabilir)
DROP POLICY IF EXISTS "HR ve şirket atama ekleyebilir" ON public.application_assignments;
CREATE POLICY "HR ve şirket atama ekleyebilir" ON public.application_assignments FOR INSERT WITH CHECK (
  assigned_by = auth.uid() AND assigned_to = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.applications a
    JOIN public.job_postings jp ON jp.id = a.job_id
    WHERE a.id = application_id
    AND (jp.company_id IN (SELECT c.id FROM public.companies c WHERE c.owner_profile_id = auth.uid() OR c.created_by = auth.uid())
         OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.company_id = jp.company_id))
  )
);

-- applications: match_details JSONB (AI eşleşme detayı - opsiyonel)
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS match_details JSONB;
