-- applications: optional expected_salary (used by job apply flow)
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS expected_salary INTEGER;

-- Saved jobs (developer "save for later" / kaydettiğim ilanlar)
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(developer_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_developer ON public.saved_jobs(developer_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job ON public.saved_jobs(job_id);

ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Kullanıcı kendi kaydettiği ilanları görebilir" ON public.saved_jobs;
CREATE POLICY "Kullanıcı kendi kaydettiği ilanları görebilir" ON public.saved_jobs
  FOR SELECT USING (auth.uid() = developer_id);
DROP POLICY IF EXISTS "Kullanıcı kendi kaydettiği ilanı ekleyebilir" ON public.saved_jobs;
CREATE POLICY "Kullanıcı kendi kaydettiği ilanı ekleyebilir" ON public.saved_jobs
  FOR INSERT WITH CHECK (auth.uid() = developer_id);
DROP POLICY IF EXISTS "Kullanıcı kendi kaydettiği ilanı silebilir" ON public.saved_jobs;
CREATE POLICY "Kullanıcı kendi kaydettiği ilanı silebilir" ON public.saved_jobs
  FOR DELETE USING (auth.uid() = developer_id);
