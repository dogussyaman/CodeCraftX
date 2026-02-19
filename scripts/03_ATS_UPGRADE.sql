-- =============================================================================
-- CodeCraftX — 03_ATS_UPGRADE.sql
-- ATS (Applicant Tracking System) için ek şema:
-- - cv_profiles & job_postings genişletme
-- - ats_scores, ai_matching_logs, scoring_algorithm_versions
-- - pgvector tabanlı yardımcı fonksiyon
-- - audit & RLS
-- =============================================================================

BEGIN;

-- ============================================
-- 1) cv_profiles genişletme (CV Parsing Layer)
-- ============================================

ALTER TABLE public.cv_profiles
  ADD COLUMN IF NOT EXISTS education_level TEXT
    CHECK (
      education_level IN (
        'high_school','associate','bachelor','master','phd',
        'bootcamp','self_taught','other'
      )
    ),
  ADD COLUMN IF NOT EXISTS previous_titles JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb;


-- ============================================
-- 2) job_postings genişletme (Job Requirement Layer)
-- ============================================

ALTER TABLE public.job_postings
  ADD COLUMN IF NOT EXISTS min_experience_years INTEGER,
  ADD COLUMN IF NOT EXISTS education_requirement TEXT
    CHECK (
      education_requirement IN (
        'high_school','associate','bachelor','master','phd','any'
      )
    ),
  ADD COLUMN IF NOT EXISTS seniority_requirement TEXT
    CHECK (
      seniority_requirement IN ('junior','mid','senior','lead','any')
    );


-- ============================================
-- 3) ATS skorları tablosu
-- ============================================

CREATE TABLE IF NOT EXISTS public.ats_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  job_id         UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  candidate_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  rule_score      NUMERIC(5,2) NOT NULL DEFAULT 0,
  semantic_score  NUMERIC(5,2) NOT NULL DEFAULT 0,
  final_score     NUMERIC(5,2) NOT NULL DEFAULT 0,

  scoring_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  algorithm_version TEXT NOT NULL DEFAULT '1.0.0',

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','calculating','completed','failed')),
  error_message TEXT,

  calculated_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(application_id, algorithm_version)
);

-- Performans indexleri
CREATE INDEX IF NOT EXISTS idx_ats_scores_job_final
  ON public.ats_scores(job_id, final_score DESC);

CREATE INDEX IF NOT EXISTS idx_ats_scores_candidate
  ON public.ats_scores(candidate_id);

CREATE INDEX IF NOT EXISTS idx_ats_scores_version_status
  ON public.ats_scores(algorithm_version, status);

CREATE INDEX IF NOT EXISTS idx_ats_scores_breakdown_gin
  ON public.ats_scores USING GIN (scoring_breakdown);

-- updated_at trigger (mevcut handle_updated_at fonksiyonunu kullanır)
DROP TRIGGER IF EXISTS set_updated_at ON public.ats_scores;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.ats_scores
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================
-- 4) AI matching log tablosu
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_matching_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  ats_score_id    UUID REFERENCES public.ats_scores(id) ON DELETE CASCADE,
  application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,

  model_used      TEXT NOT NULL,
  cv_embedding_source  TEXT CHECK (cv_embedding_source IN ('stored','generated')) NULL,
  job_embedding_source TEXT CHECK (job_embedding_source IN ('stored','generated')) NULL,

  cosine_similarity NUMERIC(6,5),
  semantic_score    NUMERIC(5,2),

  tokens_used       INTEGER,
  latency_ms        INTEGER,

  error_message     TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_matching_logs_app
  ON public.ai_matching_logs(application_id, created_at DESC);


-- ============================================
-- 5) Skorlama algoritması versiyonlama
-- ============================================

CREATE TABLE IF NOT EXISTS public.scoring_algorithm_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  description TEXT,
  weights JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Varsayılan versiyon 1.0.0 (idempotent insert)
INSERT INTO public.scoring_algorithm_versions (version, description, weights, is_active)
VALUES (
  '1.0.0',
  'Initial ATS weights',
  '{
    "rule_weight": 0.6, "semantic_weight": 0.4,
    "skill_weight": 0.50, "experience_weight": 0.25,
    "education_weight": 0.15, "optional_bonus_weight": 0.10
  }',
  TRUE
)
ON CONFLICT (version) DO NOTHING;


-- ============================================
-- 6) pgvector tabanlı yardımcı fonksiyon
-- ============================================

-- cv_id + job_id için cosine benzerliği (0–1 arası), embedding yoksa NULL döner.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'cv_job_cosine_similarity'
      AND pronamespace = 'public'::regnamespace
  ) THEN
    CREATE FUNCTION public.cv_job_cosine_similarity(p_cv_id UUID, p_job_id UUID)
    RETURNS DOUBLE PRECISION
    LANGUAGE sql
    STABLE
    AS $fn$
      SELECT
        CASE
          WHEN c.embedding IS NULL OR j.embedding IS NULL THEN NULL
          ELSE 1 - (c.embedding <=> j.embedding)
        END AS similarity
      FROM public.cv_profiles c
      JOIN public.cvs cv ON cv.id = c.cv_id
      JOIN public.job_postings j ON j.id = p_job_id
      WHERE c.cv_id = p_cv_id
      LIMIT 1;
    $fn$;
  END IF;
END $$;


-- ============================================
-- 7) Audit Logs — ats_scores için tetikleyici
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'audit_ats_scores'
      AND pronamespace = 'public'::regnamespace
  ) THEN
    CREATE FUNCTION public.audit_ats_scores()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $fn$
    DECLARE
      app_job_id UUID;
      app_company_id UUID;
    BEGIN
      SELECT a.job_id, jp.company_id
        INTO app_job_id, app_company_id
      FROM public.applications a
      JOIN public.job_postings jp ON jp.id = a.job_id
      WHERE a.id = COALESCE(NEW.application_id, OLD.application_id)
      LIMIT 1;

      IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (action, entity_type, entity_id, performed_by, company_id, new_data)
        VALUES ('insert', 'ats_score', NEW.id, auth.uid(), app_company_id, to_jsonb(NEW));
      ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (action, entity_type, entity_id, performed_by, company_id, old_data, new_data)
        VALUES ('update', 'ats_score', NEW.id, auth.uid(), app_company_id, to_jsonb(OLD), to_jsonb(NEW));
      ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (action, entity_type, entity_id, performed_by, company_id, old_data)
        VALUES ('delete', 'ats_score', OLD.id, auth.uid(), app_company_id, to_jsonb(OLD));
      END IF;

      RETURN COALESCE(NEW, OLD);
    END;
    $fn$;
  END IF;
END $$;

DROP TRIGGER IF EXISTS audit_ats_scores_trigger ON public.ats_scores;
CREATE TRIGGER audit_ats_scores_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.ats_scores
  FOR EACH ROW EXECUTE FUNCTION public.audit_ats_scores();


-- ============================================
-- 8) RLS Policies
-- ============================================

-- ats_scores: aday, İK ve admin roller için görünür; yazma işlemleri genellikle service role üzerinden yapılır.
ALTER TABLE public.ats_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Aday kendi ATS skorunu görebilir" ON public.ats_scores;
CREATE POLICY "Aday kendi ATS skorunu görebilir"
  ON public.ats_scores
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.applications a
      WHERE a.id = ats_scores.application_id
        AND a.developer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "İK şirket ATS skorlarını görebilir" ON public.ats_scores;
CREATE POLICY "İK şirket ATS skorlarını görebilir"
  ON public.ats_scores
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.applications a
      JOIN public.job_postings jp ON jp.id = a.job_id
      JOIN public.profiles p ON p.company_id = jp.company_id
      WHERE a.id = ats_scores.application_id
        AND p.id = auth.uid()
        AND p.role IN ('hr','admin','company_admin','platform_admin')
    )
  );

DROP POLICY IF EXISTS "Sistem ATS skoru yazabilir" ON public.ats_scores;
CREATE POLICY "Sistem ATS skoru yazabilir"
  ON public.ats_scores
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Sistem ATS skorunu güncelleyebilir" ON public.ats_scores;
CREATE POLICY "Sistem ATS skorunu güncelleyebilir"
  ON public.ats_scores
  FOR UPDATE
  USING (true);


-- ai_matching_logs: sadece admin / platform_admin ve service role tarafında kullanılır.
ALTER TABLE public.ai_matching_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "AI matching log sadece admin görebilir" ON public.ai_matching_logs;
CREATE POLICY "AI matching log sadece admin görebilir"
  ON public.ai_matching_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin','platform_admin')
    )
  );

DROP POLICY IF EXISTS "Sistem AI matching log yazabilir" ON public.ai_matching_logs;
CREATE POLICY "Sistem AI matching log yazabilir"
  ON public.ai_matching_logs
  FOR INSERT
  WITH CHECK (true);

COMMIT;

