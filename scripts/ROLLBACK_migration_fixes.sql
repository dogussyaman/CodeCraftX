-- =============================================================================
-- CodeCraftX — migration_fixes.sql GERİ ALMA (Rollback)
-- migration_fixes.sql uygulandıktan sonra değişiklikleri geri alır.
-- Veri geri dönüşümü (applications.status İngilizce→Türkçe) yapılmaz; sadece
-- policy, trigger, constraint ve index'ler eski haline getirilir.
-- =============================================================================

BEGIN;

-- =====================
-- ROLLBACK FIX #16: audit_logs indexleri
-- =====================
DROP INDEX IF EXISTS idx_audit_logs_entity;
DROP INDEX IF EXISTS idx_audit_logs_company;

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON public.audit_logs(company_id);

-- =====================
-- ROLLBACK FIX #15: community_members role CHECK
-- =====================
ALTER TABLE public.community_members
  DROP CONSTRAINT IF EXISTS community_members_role_check;
ALTER TABLE public.community_members
  ADD CONSTRAINT community_members_role_check
  CHECK (role = 'member');

-- =====================
-- ROLLBACK FIX #14: saved_jobs UNIQUE
-- =====================
ALTER TABLE public.saved_jobs
  DROP CONSTRAINT IF EXISTS saved_jobs_developer_id_job_id_key;

-- =====================
-- ROLLBACK FIX #13: project_likes UNIQUE
-- =====================
ALTER TABLE public.project_likes
  DROP CONSTRAINT IF EXISTS project_likes_project_id_user_id_key;

-- =====================
-- ROLLBACK FIX #12: blog_post_likes UNIQUE
-- =====================
ALTER TABLE public.blog_post_likes
  DROP CONSTRAINT IF EXISTS blog_post_likes_post_id_user_id_key;

-- =====================
-- ROLLBACK FIX #11: pgvector indexleri
-- =====================
DROP INDEX IF EXISTS idx_cv_profiles_embedding;
DROP INDEX IF EXISTS idx_job_postings_embedding;

-- =====================
-- ROLLBACK FIX #10: job_postings search_vector index
-- =====================
DROP INDEX IF EXISTS idx_job_postings_search_vector;

-- =====================
-- ROLLBACK FIX #9: email_queue pending index
-- =====================
DROP INDEX IF EXISTS idx_email_queue_pending;

-- =====================
-- ROLLBACK FIX #8: job_skills UNIQUE
-- =====================
ALTER TABLE public.job_skills
  DROP CONSTRAINT IF EXISTS job_skills_job_id_skill_id_key;

-- =====================
-- ROLLBACK FIX #7: developer_skills UNIQUE
-- =====================
ALTER TABLE public.developer_skills
  DROP CONSTRAINT IF EXISTS developer_skills_developer_id_skill_id_key;

-- =====================
-- ROLLBACK FIX #6: company_subscriptions sync trigger ve fonksiyon
-- =====================
DROP TRIGGER IF EXISTS trg_sync_company_subscription ON public.company_subscriptions;
DROP FUNCTION IF EXISTS public.sync_company_subscription();

-- =====================
-- ROLLBACK FIX #5: applications.status CHECK (eski Türkçe+İngilizce değerler)
-- =====================
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE public.applications
  ADD CONSTRAINT applications_status_check
  CHECK (status = ANY (ARRAY[
    'yeni', 'değerlendiriliyor', 'randevu', 'teklif', 'red',
    'pending', 'reviewed', 'interview', 'offered', 'rejected', 'accepted'
  ]));

-- =====================
-- ROLLBACK FIX #4: interviews SELECT policy
-- =====================
DROP POLICY IF EXISTS "Mülakatları görebilir" ON public.interviews;
CREATE POLICY "İlgili kullanıcılar mülakat görebilir" ON public.interviews
  FOR SELECT USING (true);

-- =====================
-- ROLLBACK FIX #3: application_notes SELECT policy
-- =====================
DROP POLICY IF EXISTS "Notları görebilir" ON public.application_notes;
CREATE POLICY "İlgili kullanıcılar notları görebilir" ON public.application_notes
  FOR SELECT USING (true);

-- =====================
-- ROLLBACK FIX #2: matches INSERT policy
-- =====================
DROP POLICY IF EXISTS "Sistem eşleşme oluşturabilir" ON public.matches;
CREATE POLICY "Sistem eşleşme oluşturabilir" ON public.matches
  FOR INSERT WITH CHECK (true);

-- =====================
-- ROLLBACK FIX #1: applications UPDATE policy
-- =====================
DROP POLICY IF EXISTS "Geliştirici kendi başvurusunu güncelleyebilir" ON public.applications;
DROP POLICY IF EXISTS "HR şirket başvurularını güncelleyebilir" ON public.applications;
CREATE POLICY "İlgili kullanıcılar başvuru güncelleyebilir" ON public.applications
  FOR UPDATE USING (true);

COMMIT;
