-- Job postings: multilingual (TR/EN/DE), optional fields, list structures (JSONB)
-- All new columns are optional (NULL or empty array).

-- 1. Location and work preference
ALTER TABLE public.job_postings
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS work_preference TEXT CHECK (work_preference IN ('on-site', 'remote', 'hybrid'));

-- Allow multiple work preferences per job (e.g. "on-site" and "hybrid") – store as JSONB array
ALTER TABLE public.job_postings
  ADD COLUMN IF NOT EXISTS work_preference_list JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.job_postings.work_preference IS 'Single primary work preference (legacy). Prefer work_preference_list for multiple.';
COMMENT ON COLUMN public.job_postings.work_preference_list IS 'Array of work preferences, e.g. ["on-site", "hybrid"]';

-- 2. Multilingual: EN/DE (TR remains in title, description)
ALTER TABLE public.job_postings
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_de TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_de TEXT;

-- 3. Requirements as JSONB list per language + optional section titles
ALTER TABLE public.job_postings
  ADD COLUMN IF NOT EXISTS requirements_tr JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS requirements_en JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS requirements_de JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS requirements_title_tr TEXT,
  ADD COLUMN IF NOT EXISTS requirements_title_en TEXT,
  ADD COLUMN IF NOT EXISTS requirements_title_de TEXT,
  ADD COLUMN IF NOT EXISTS requirements_subtitle_tr TEXT,
  ADD COLUMN IF NOT EXISTS requirements_subtitle_en TEXT,
  ADD COLUMN IF NOT EXISTS requirements_subtitle_de TEXT;

-- 4. Candidate criteria (optional section)
ALTER TABLE public.job_postings
  ADD COLUMN IF NOT EXISTS candidate_criteria_tr JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS candidate_criteria_en JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS candidate_criteria_de JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS candidate_criteria_title_tr TEXT,
  ADD COLUMN IF NOT EXISTS candidate_criteria_title_en TEXT,
  ADD COLUMN IF NOT EXISTS candidate_criteria_title_de TEXT;

-- 5. Responsibilities as JSONB list per language (optional)
ALTER TABLE public.job_postings
  ADD COLUMN IF NOT EXISTS responsibilities_tr JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS responsibilities_en JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS responsibilities_de JSONB DEFAULT '[]'::jsonb;

-- 6. Salary expectation in application form (used by IK dashboard)
ALTER TABLE public.job_postings
  ADD COLUMN IF NOT EXISTS ask_expected_salary BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS expected_salary_required BOOLEAN DEFAULT FALSE;

-- Constraint: expected_salary_required only when ask_expected_salary is true
ALTER TABLE public.job_postings
  DROP CONSTRAINT IF EXISTS chk_expected_salary_implies_ask;

ALTER TABLE public.job_postings
  ADD CONSTRAINT chk_expected_salary_implies_ask CHECK (
    (ask_expected_salary = FALSE AND expected_salary_required = FALSE) OR
    (ask_expected_salary = TRUE)
  );

-- 7. Make legacy requirements nullable so TR can use requirements_tr only
ALTER TABLE public.job_postings
  ALTER COLUMN requirements DROP NOT NULL;

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_job_postings_country ON public.job_postings(country) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_job_postings_city ON public.job_postings(city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_job_postings_work_preference ON public.job_postings(work_preference) WHERE work_preference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_job_postings_work_preference_list ON public.job_postings USING GIN (work_preference_list);
