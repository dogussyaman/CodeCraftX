-- =============================================================================
-- CodeCraftX — Schema Güvenlik & İyileştirme Migration
-- Uygulama hedefi: Supabase PostgreSQL (proje adınızı buraya yazın)
-- Bu dosyayı Supabase SQL Editor'da veya migration aracıyla çalıştırın.
-- Tüm değişiklikler tek transaction'da, idempotent (birden fazla çalıştırma güvenli).
-- =============================================================================

BEGIN;

-- =====================
-- FIX #1: applications UPDATE policy — sadece ilgili kullanıcılar güncelleyebilir
-- =====================
DROP POLICY IF EXISTS "İlgili kullanıcılar başvuru güncelleyebilir" ON public.applications;

CREATE POLICY "Geliştirici kendi başvurusunu güncelleyebilir"
  ON public.applications FOR UPDATE
  USING (developer_id = auth.uid());

CREATE POLICY "HR şirket başvurularını güncelleyebilir"
  ON public.applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.job_postings jp
      JOIN public.profiles p ON p.company_id = jp.company_id
      WHERE jp.id = applications.job_id
        AND p.id = auth.uid()
        AND p.role IN ('hr', 'admin', 'company_admin', 'platform_admin')
    )
  );

-- =====================
-- FIX #2: matches INSERT policy — sadece giriş yapmış kullanıcı
-- =====================
DROP POLICY IF EXISTS "Sistem eşleşme oluşturabilir" ON public.matches;

CREATE POLICY "Sistem eşleşme oluşturabilir" ON public.matches
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================
-- FIX #3: application_notes SELECT policy — gizli notlar adaydan saklı
-- =====================
DROP POLICY IF EXISTS "İlgili kullanıcılar notları görebilir" ON public.application_notes;

CREATE POLICY "Notları görebilir"
  ON public.application_notes FOR SELECT
  USING (
    created_by = auth.uid()
    OR
    (
      is_visible_to_developer = true
      AND EXISTS (
        SELECT 1 FROM public.applications a
        WHERE a.id = application_notes.application_id
          AND a.developer_id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('hr', 'admin', 'company_admin', 'platform_admin')
    )
  );

-- =====================
-- FIX #4: interviews SELECT policy — sadece ilgili kullanıcılar
-- =====================
DROP POLICY IF EXISTS "İlgili kullanıcılar mülakat görebilir" ON public.interviews;

CREATE POLICY "Mülakatları görebilir"
  ON public.interviews FOR SELECT
  USING (
    scheduled_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.applications a
      WHERE a.id = interviews.application_id
        AND a.developer_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('hr', 'admin', 'company_admin', 'platform_admin')
    )
  );

-- =====================
-- FIX #5: applications.status tek dile (İngilizce) standardize
-- Etkilenen satır sayısı: migration öncesi kontrol için:
--   SELECT status, count(*) FROM public.applications GROUP BY status;
-- =====================
UPDATE public.applications SET status = 'pending'   WHERE status = 'yeni';
UPDATE public.applications SET status = 'reviewed'  WHERE status = 'değerlendiriliyor';
UPDATE public.applications SET status = 'interview' WHERE status = 'randevu';
UPDATE public.applications SET status = 'offered'   WHERE status = 'teklif';
UPDATE public.applications SET status = 'rejected'  WHERE status = 'red';

ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE public.applications
  ADD CONSTRAINT applications_status_check
  CHECK (status = ANY (ARRAY[
    'pending', 'reviewed', 'interview', 'offered', 'rejected', 'accepted'
  ]));

-- =====================
-- FIX #6: companies ↔ company_subscriptions senkron trigger (SECURITY DEFINER)
-- =====================
CREATE OR REPLACE FUNCTION public.sync_company_subscription()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.companies
  SET
    subscription_status = NEW.status,
    subscription_started_at = NEW.started_at,
    subscription_ends_at = NEW.ends_at,
    updated_at = NOW()
  WHERE id = NEW.company_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_company_subscription ON public.company_subscriptions;
CREATE TRIGGER trg_sync_company_subscription
  AFTER INSERT OR UPDATE ON public.company_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_company_subscription();

-- =====================
-- FIX #7: developer_skills UNIQUE(developer_id, skill_id)
-- =====================
DELETE FROM public.developer_skills
WHERE id NOT IN (
  SELECT DISTINCT ON (developer_id, skill_id) id
  FROM public.developer_skills
  ORDER BY developer_id, skill_id, id DESC
);

ALTER TABLE public.developer_skills
  DROP CONSTRAINT IF EXISTS developer_skills_developer_id_skill_id_key;
ALTER TABLE public.developer_skills
  ADD CONSTRAINT developer_skills_developer_id_skill_id_key
  UNIQUE (developer_id, skill_id);

-- =====================
-- FIX #8: job_skills UNIQUE(job_id, skill_id)
-- =====================
DELETE FROM public.job_skills
WHERE id NOT IN (
  SELECT DISTINCT ON (job_id, skill_id) id
  FROM public.job_skills
  ORDER BY job_id, skill_id, id DESC
);

ALTER TABLE public.job_skills
  DROP CONSTRAINT IF EXISTS job_skills_job_id_skill_id_key;
ALTER TABLE public.job_skills
  ADD CONSTRAINT job_skills_job_id_skill_id_key
  UNIQUE (job_id, skill_id);

-- =====================
-- FIX #9: email_queue pending index
-- =====================
CREATE INDEX IF NOT EXISTS idx_email_queue_pending
  ON public.email_queue(created_at)
  WHERE status = 'pending';

-- =====================
-- FIX #10: job_postings full-text search GIN index
-- =====================
CREATE INDEX IF NOT EXISTS idx_job_postings_search_vector
  ON public.job_postings USING GIN(search_vector)
  WHERE search_vector IS NOT NULL;

-- =====================
-- FIX #11: vector embedding indexleri (pgvector) — extension yoksa atla
-- =====================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    DROP INDEX IF EXISTS idx_cv_profiles_embedding;
    EXECUTE 'CREATE INDEX idx_cv_profiles_embedding ON public.cv_profiles USING hnsw(embedding vector_cosine_ops) WHERE embedding IS NOT NULL';
    DROP INDEX IF EXISTS idx_job_postings_embedding;
    EXECUTE 'CREATE INDEX idx_job_postings_embedding ON public.job_postings USING hnsw(embedding vector_cosine_ops) WHERE embedding IS NOT NULL';
  END IF;
END;
$$;

-- =====================
-- FIX #12: blog_post_likes UNIQUE(post_id, user_id)
-- =====================
DELETE FROM public.blog_post_likes
WHERE id NOT IN (
  SELECT DISTINCT ON (post_id, user_id) id
  FROM public.blog_post_likes
  ORDER BY post_id, user_id, created_at DESC
);

ALTER TABLE public.blog_post_likes
  DROP CONSTRAINT IF EXISTS blog_post_likes_post_id_user_id_key;
ALTER TABLE public.blog_post_likes
  ADD CONSTRAINT blog_post_likes_post_id_user_id_key
  UNIQUE (post_id, user_id);

-- =====================
-- FIX #13: project_likes UNIQUE(project_id, user_id)
-- =====================
DELETE FROM public.project_likes
WHERE id NOT IN (
  SELECT DISTINCT ON (project_id, user_id) id
  FROM public.project_likes
  ORDER BY project_id, user_id, created_at DESC
);

ALTER TABLE public.project_likes
  DROP CONSTRAINT IF EXISTS project_likes_project_id_user_id_key;
ALTER TABLE public.project_likes
  ADD CONSTRAINT project_likes_project_id_user_id_key
  UNIQUE (project_id, user_id);

-- =====================
-- FIX #14: saved_jobs UNIQUE(developer_id, job_id)
-- =====================
DELETE FROM public.saved_jobs
WHERE id NOT IN (
  SELECT DISTINCT ON (developer_id, job_id) id
  FROM public.saved_jobs
  ORDER BY developer_id, job_id, created_at DESC
);

ALTER TABLE public.saved_jobs
  DROP CONSTRAINT IF EXISTS saved_jobs_developer_id_job_id_key;
ALTER TABLE public.saved_jobs
  ADD CONSTRAINT saved_jobs_developer_id_job_id_key
  UNIQUE (developer_id, job_id);

-- =====================
-- FIX #15: community_members.role constraint — member, moderator, admin
-- =====================
ALTER TABLE public.community_members
  DROP CONSTRAINT IF EXISTS community_members_role_check;
ALTER TABLE public.community_members
  ADD CONSTRAINT community_members_role_check
  CHECK (role = ANY (ARRAY['member', 'moderator', 'admin']));

-- =====================
-- FIX #16: audit_logs indexleri (mevcut farklı tanımlı index varsa DROP ile değiştir)
-- =====================
DROP INDEX IF EXISTS idx_audit_logs_entity;
DROP INDEX IF EXISTS idx_audit_logs_company;

CREATE INDEX idx_audit_logs_entity
  ON public.audit_logs(entity_type, entity_id, created_at DESC)
  WHERE entity_id IS NOT NULL;

CREATE INDEX idx_audit_logs_company
  ON public.audit_logs(company_id, created_at DESC)
  WHERE company_id IS NOT NULL;

COMMIT;
