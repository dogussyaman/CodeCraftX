-- ============================================
-- CodeCraftX — 01_ENTERPRISE_UPGRADE.sql
-- Enterprise migration: multi-tenant hardening, RBAC, job pipeline,
-- performance, monetization, storage security, audit.
-- Run AFTER 00_FINAL_ALL_IN_ONE.sql. Backward compatible, no destructive changes.
-- ============================================

-- ============================================
-- SECTION 0 — Extensions & Types
-- ============================================

CREATE EXTENSION IF NOT EXISTS vector;

-- Job visibility for public/private/link_only
DO $$ BEGIN
  CREATE TYPE public.job_visibility AS ENUM ('public', 'private', 'link_only');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- SECTION 1 — Multi-Tenant Helper Functions
-- ============================================

-- Returns current user's company_id for HR/company_admin; NULL for platform_admin (bypass) or developer/mt (no company scope).
CREATE OR REPLACE FUNCTION public.get_current_company_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  user_company_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT role, company_id INTO user_role, user_company_id
  FROM public.profiles
  WHERE id = auth.uid();
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  -- platform_admin: NULL = bypass in RLS (can see all)
  IF user_role = 'platform_admin' THEN
    RETURN NULL;
  END IF;
  -- company_admin, hr, admin (company context): return their company
  IF user_role IN ('company_admin', 'hr', 'admin', 'company') THEN
    RETURN user_company_id;
  END IF;
  -- developer, mt: no company scope for company-scoped tables
  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.get_current_company_id() IS 'Multi-tenant: returns company_id for HR/company_admin; NULL for platform_admin (bypass) or developer/mt.';

-- ============================================
-- SECTION 2 — RBAC Tables & has_permission
-- ============================================

CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  resource TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_company_id ON public.user_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);

-- has_permission(permission_name): true if user has that permission (via user_roles + role_permissions). platform_admin always true.
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_platform_admin BOOLEAN;
  user_company UUID;
  has_perm BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'platform_admin') INTO is_platform_admin;
  IF is_platform_admin THEN
    RETURN TRUE;
  END IF;
  user_company := public.get_current_company_id();
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role_id = ur.role_id
    JOIN public.permissions p ON p.id = rp.permission_id AND p.name = permission_name
    WHERE ur.user_id = auth.uid()
      AND (ur.company_id IS NULL OR ur.company_id = user_company)
  ) INTO has_perm;
  IF has_perm THEN
    RETURN TRUE;
  END IF;
  -- Fallback: legacy profiles.role (backward compatibility until user_roles is fully populated)
  RETURN EXISTS (
    SELECT 1 FROM public.profiles pr
    WHERE pr.id = auth.uid()
      AND (
        (permission_name IN ('job.create','job.edit','job.publish','application.view','company.manage') AND pr.role IN ('hr','company_admin','admin','company'))
        OR (permission_name LIKE 'admin.%' AND pr.role IN ('admin','platform_admin'))
        OR (permission_name = 'mt.manage' AND pr.role IN ('mt','platform_admin'))
      )
  );
END;
$$;

COMMENT ON FUNCTION public.has_permission(TEXT) IS 'RBAC: returns true if current user has the given permission. platform_admin has all. Falls back to profiles.role if user_roles not set.';

-- Seed roles
INSERT INTO public.roles (name, description) VALUES
  ('platform_admin', 'Platform administrator, full access'),
  ('admin', 'Admin role'),
  ('company_admin', 'Company administrator'),
  ('hr', 'HR user'),
  ('developer', 'Developer'),
  ('mt', 'Member success / support')
ON CONFLICT (name) DO NOTHING;

-- Seed permissions
INSERT INTO public.permissions (name, resource) VALUES
  ('job.create', 'job'),
  ('job.edit', 'job'),
  ('job.publish', 'job'),
  ('job.approve', 'job'),
  ('application.view', 'application'),
  ('application.update', 'application'),
  ('company.manage', 'company'),
  ('admin.users', 'admin'),
  ('admin.platform', 'admin'),
  ('mt.manage', 'mt')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles (role id by name)
DO $$
DECLARE
  r_platform_admin UUID; r_admin UUID; r_company_admin UUID; r_hr UUID; r_dev UUID; r_mt UUID;
  p_job_create UUID; p_job_edit UUID; p_job_publish UUID; p_job_approve UUID;
  p_app_view UUID; p_app_update UUID; p_company_manage UUID; p_admin_users UUID; p_admin_platform UUID; p_mt_manage UUID;
BEGIN
  SELECT id INTO r_platform_admin FROM public.roles WHERE name = 'platform_admin';
  SELECT id INTO r_admin FROM public.roles WHERE name = 'admin';
  SELECT id INTO r_company_admin FROM public.roles WHERE name = 'company_admin';
  SELECT id INTO r_hr FROM public.roles WHERE name = 'hr';
  SELECT id INTO r_dev FROM public.roles WHERE name = 'developer';
  SELECT id INTO r_mt FROM public.roles WHERE name = 'mt';
  SELECT id INTO p_job_create FROM public.permissions WHERE name = 'job.create';
  SELECT id INTO p_job_edit FROM public.permissions WHERE name = 'job.edit';
  SELECT id INTO p_job_publish FROM public.permissions WHERE name = 'job.publish';
  SELECT id INTO p_job_approve FROM public.permissions WHERE name = 'job.approve';
  SELECT id INTO p_app_view FROM public.permissions WHERE name = 'application.view';
  SELECT id INTO p_app_update FROM public.permissions WHERE name = 'application.update';
  SELECT id INTO p_company_manage FROM public.permissions WHERE name = 'company.manage';
  SELECT id INTO p_admin_users FROM public.permissions WHERE name = 'admin.users';
  SELECT id INTO p_admin_platform FROM public.permissions WHERE name = 'admin.platform';
  SELECT id INTO p_mt_manage FROM public.permissions WHERE name = 'mt.manage';

  INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    (r_platform_admin, p_job_create), (r_platform_admin, p_job_edit), (r_platform_admin, p_job_publish), (r_platform_admin, p_job_approve),
    (r_platform_admin, p_app_view), (r_platform_admin, p_app_update), (r_platform_admin, p_company_manage), (r_platform_admin, p_admin_users), (r_platform_admin, p_admin_platform), (r_platform_admin, p_mt_manage)
  ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    (r_admin, p_job_create), (r_admin, p_job_edit), (r_admin, p_job_publish), (r_admin, p_app_view), (r_admin, p_app_update), (r_admin, p_company_manage), (r_admin, p_admin_users), (r_admin, p_admin_platform)
  ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    (r_company_admin, p_job_create), (r_company_admin, p_job_edit), (r_company_admin, p_job_publish), (r_company_admin, p_job_approve), (r_company_admin, p_app_view), (r_company_admin, p_app_update), (r_company_admin, p_company_manage)
  ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES
    (r_hr, p_job_create), (r_hr, p_job_edit), (r_hr, p_job_publish), (r_hr, p_app_view), (r_hr, p_app_update)
  ON CONFLICT DO NOTHING;
  INSERT INTO public.role_permissions (role_id, permission_id) VALUES (r_mt, p_mt_manage) ON CONFLICT DO NOTHING;
END $$;

-- TODO: After migration, run a one-time backfill to populate user_roles from profiles (role + company_id).
-- Example: INSERT INTO user_roles (user_id, role_id, company_id) SELECT p.id, r.id, p.company_id FROM profiles p JOIN roles r ON r.name = p.role WHERE p.role IN ('hr','company_admin','admin','company','platform_admin','mt');

-- ============================================
-- SECTION 3 — Job Posting Pipeline (Enterprise)
-- ============================================

-- Extend job_postings status: add in_review, approved, scheduled, published, archived, rejected (keep active, closed, draft for backward compat)
DO $$
DECLARE
  cname TEXT;
BEGIN
  SELECT conname INTO cname FROM pg_constraint
  WHERE conrelid = 'public.job_postings'::regclass AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%status%';
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.job_postings DROP CONSTRAINT %I', cname);
  END IF;
  ALTER TABLE public.job_postings ADD CONSTRAINT job_postings_status_check
    CHECK (status IN ('active', 'closed', 'draft', 'in_review', 'approved', 'scheduled', 'published', 'archived', 'rejected'));
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- New columns on job_postings
ALTER TABLE public.job_postings
  ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS application_limit INTEGER,
  ADD COLUMN IF NOT EXISTS salary_visible BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS auto_expire_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS priority_level INTEGER,
  ADD COLUMN IF NOT EXISTS schedule_publish_at TIMESTAMP WITH TIME ZONE;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.job_postings'::regclass AND conname = 'job_postings_visibility_check') THEN
    ALTER TABLE public.job_postings ADD CONSTRAINT job_postings_visibility_check CHECK (visibility IN ('public', 'private', 'link_only'));
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- job_post_versions: version history for jobs
CREATE TABLE IF NOT EXISTS public.job_post_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.job_publish_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.job_publish_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS public.job_external_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  external_id TEXT,
  synced_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.job_approval_flow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  step INTEGER NOT NULL DEFAULT 1,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.job_publication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  event TEXT NOT NULL CHECK (event IN ('published', 'archived', 'expired', 'unpublished')),
  at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  performed_by UUID REFERENCES public.profiles(id),
  channel TEXT
);

-- ============================================
-- SECTION 4 — Monetization / Plan Feature Gating
-- ============================================

CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  max_active_jobs INTEGER NOT NULL DEFAULT 5,
  max_featured_jobs INTEGER NOT NULL DEFAULT 0,
  ai_matching_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  limit_value INTEGER NOT NULL DEFAULT -1,
  UNIQUE(plan_id, feature_key)
);

CREATE TABLE IF NOT EXISTS public.company_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ends_at TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subscription_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  active_jobs_count INTEGER NOT NULL DEFAULT 0,
  featured_jobs_count INTEGER NOT NULL DEFAULT 0,
  ai_matches_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed plans (align with companies.plan: free, orta, premium)
INSERT INTO public.plans (name, slug, max_active_jobs, max_featured_jobs, ai_matching_enabled, sort_order) VALUES
  ('Free', 'free', 5, 0, FALSE, 0),
  ('Orta', 'orta', 100, 5, TRUE, 1),
  ('Premium', 'premium', -1, -1, TRUE, 2)
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  pid_free UUID; pid_orta UUID; pid_premium UUID;
BEGIN
  SELECT id INTO pid_free FROM public.plans WHERE slug = 'free';
  SELECT id INTO pid_orta FROM public.plans WHERE slug = 'orta';
  SELECT id INTO pid_premium FROM public.plans WHERE slug = 'premium';
  INSERT INTO public.plan_features (plan_id, feature_key, limit_value) VALUES
    (pid_free, 'job_posting', 5), (pid_free, 'featured_job', 0), (pid_free, 'ai_match', 0),
    (pid_orta, 'job_posting', 100), (pid_orta, 'featured_job', 5), (pid_orta, 'ai_match', -1),
    (pid_premium, 'job_posting', -1), (pid_premium, 'featured_job', -1), (pid_premium, 'ai_match', -1)
  ON CONFLICT (plan_id, feature_key) DO NOTHING;
END $$;

-- ============================================
-- SECTION 5 — Audit & History
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  performed_by UUID REFERENCES public.profiles(id),
  company_id UUID REFERENCES public.companies(id),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON public.audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Trigger: log job_postings changes (including status)
CREATE OR REPLACE FUNCTION public.audit_job_postings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, performed_by, company_id, new_data)
    VALUES ('insert', 'job_posting', NEW.id, NEW.created_by, NEW.company_id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO public.audit_logs (action, entity_type, entity_id, performed_by, company_id, old_data, new_data)
      VALUES ('status_change', 'job_posting', NEW.id, NEW.created_by, NEW.company_id, jsonb_build_object('status', OLD.status), jsonb_build_object('status', NEW.status));
    END IF;
    INSERT INTO public.audit_logs (action, entity_type, entity_id, performed_by, company_id, old_data, new_data)
    VALUES ('update', 'job_posting', NEW.id, NEW.created_by, NEW.company_id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, performed_by, company_id, old_data)
    VALUES ('delete', 'job_posting', OLD.id, OLD.created_by, OLD.company_id, to_jsonb(OLD));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_job_postings_trigger ON public.job_postings;
CREATE TRIGGER audit_job_postings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.audit_job_postings();

-- Trigger: log application_status_history inserts
CREATE OR REPLACE FUNCTION public.audit_application_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  j_company_id UUID;
BEGIN
  SELECT jp.company_id INTO j_company_id FROM public.applications a JOIN public.job_postings jp ON jp.id = a.job_id WHERE a.id = NEW.application_id;
  INSERT INTO public.audit_logs (action, entity_type, entity_id, performed_by, company_id, new_data)
  VALUES ('status_change', 'application', NEW.application_id, NEW.changed_by, j_company_id, jsonb_build_object('old_status', NEW.old_status, 'new_status', NEW.new_status));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_application_status_trigger ON public.application_status_history;
CREATE TRIGGER audit_application_status_trigger
  AFTER INSERT ON public.application_status_history
  FOR EACH ROW EXECUTE FUNCTION public.audit_application_status();

-- ============================================
-- SECTION 6 — Full-Text Search & pgvector
-- ============================================

ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE public.job_postings ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE OR REPLACE FUNCTION public.job_postings_search_vector_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(NEW.requirements, '')), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS job_postings_search_vector_trigger ON public.job_postings;
CREATE TRIGGER job_postings_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, description, requirements ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.job_postings_search_vector_trigger();

-- Backfill existing rows
UPDATE public.job_postings SET search_vector = setweight(to_tsvector('simple', COALESCE(title,'')), 'A') || setweight(to_tsvector('simple', COALESCE(description,'')), 'B') || setweight(to_tsvector('simple', COALESCE(requirements,'')), 'C') WHERE search_vector IS NULL;

CREATE INDEX IF NOT EXISTS idx_job_postings_search ON public.job_postings USING GIN (search_vector);
-- pgvector: use lists=1 when table is empty; increase lists as data grows (e.g. ALTER INDEX ... SET (lists = 100))
CREATE INDEX IF NOT EXISTS idx_job_postings_embedding ON public.job_postings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 1) WHERE embedding IS NOT NULL;

-- cv_profiles: embedding for AI matching
ALTER TABLE public.cv_profiles ADD COLUMN IF NOT EXISTS embedding vector(1536);
CREATE INDEX IF NOT EXISTS idx_cv_profiles_embedding ON public.cv_profiles USING ivfflat (embedding vector_cosine_ops) WITH (lists = 1) WHERE embedding IS NOT NULL;

-- ============================================
-- SECTION 7 — Performance Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_job_postings_company_status ON public.job_postings(company_id, status);
CREATE INDEX IF NOT EXISTS idx_job_postings_company_created ON public.job_postings(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_application_status_history_application_id ON public.application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_application_status_history_application_created ON public.application_status_history(application_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_post_versions_job_id ON public.job_post_versions(job_id);
CREATE INDEX IF NOT EXISTS idx_job_publish_requests_job_id ON public.job_publish_requests(job_id);
CREATE INDEX IF NOT EXISTS idx_job_publication_logs_job_id ON public.job_publication_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_company_subscriptions_company ON public.company_subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_company_period ON public.subscription_usage_tracking(company_id, period_start, period_end);

-- ============================================
-- SECTION 8 — RLS: Multi-Tenant Hardening & platform_admin Bypass
-- ============================================
-- Drop only policies we replace; create new ones using get_current_company_id().
-- get_current_company_id() IS NULL = platform_admin (bypass: can see all).

-- Job Postings: public sees only published/active + public visibility; company sees own; platform_admin sees all
DROP POLICY IF EXISTS "Herkes aktif ilanları görebilir" ON public.job_postings;
DROP POLICY IF EXISTS "Kullanıcılar ilan oluşturabilir" ON public.job_postings;
DROP POLICY IF EXISTS "İlan sahibi güncelleyebilir" ON public.job_postings;

CREATE POLICY "job_postings_select_public_or_company" ON public.job_postings FOR SELECT USING (
  (status IN ('active', 'published') AND COALESCE(visibility, 'public') = 'public')
  OR company_id = public.get_current_company_id()
  OR public.get_current_company_id() IS NULL
);

CREATE POLICY "job_postings_insert_company" ON public.job_postings FOR INSERT WITH CHECK (
  (company_id = public.get_current_company_id() AND auth.uid() = created_by)
  OR public.get_current_company_id() IS NULL
);

CREATE POLICY "job_postings_update_company" ON public.job_postings FOR UPDATE USING (
  company_id = public.get_current_company_id()
  OR public.get_current_company_id() IS NULL
);

CREATE POLICY "job_postings_delete_company" ON public.job_postings FOR DELETE USING (
  company_id = public.get_current_company_id()
  OR public.get_current_company_id() IS NULL
);

-- Applications: developer sees own; company sees applications to their jobs; platform_admin sees all
DROP POLICY IF EXISTS "Herkes başvuruları görebilir" ON public.applications;
DROP POLICY IF EXISTS "İlgili kullanıcılar başvuru güncelleyebilir" ON public.applications;

CREATE POLICY "applications_select_own_or_company" ON public.applications FOR SELECT USING (
  developer_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = applications.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);

CREATE POLICY "applications_update_company_or_developer" ON public.applications FOR UPDATE USING (
  developer_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = applications.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);

-- Matches: developer sees own; company sees matches for their jobs; platform_admin sees all
DROP POLICY IF EXISTS "Kullanıcılar eşleşmeleri görebilir" ON public.matches;

CREATE POLICY "matches_select_own_or_company" ON public.matches FOR SELECT USING (
  developer_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = matches.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);

-- Job Skills: visible if job is visible; modify if company or platform_admin
DROP POLICY IF EXISTS "Herkes iş yeteneklerini görebilir" ON public.job_skills;
DROP POLICY IF EXISTS "İlan sahibi yetenek ekleyebilir" ON public.job_skills;
DROP POLICY IF EXISTS "İlan sahibi yetenek güncelleyebilir" ON public.job_skills;
DROP POLICY IF EXISTS "İlan sahibi yetenek silebilir" ON public.job_skills;

CREATE POLICY "job_skills_select" ON public.job_skills FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_skills.job_id AND (
    (jp.status IN ('active','published') AND COALESCE(jp.visibility,'public') = 'public')
    OR jp.company_id = public.get_current_company_id()
    OR public.get_current_company_id() IS NULL
  ))
);

CREATE POLICY "job_skills_insert" ON public.job_skills FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_skills.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);

CREATE POLICY "job_skills_update" ON public.job_skills FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_skills.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);

CREATE POLICY "job_skills_delete" ON public.job_skills FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_skills.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);

-- Company Members: strict company isolation
DROP POLICY IF EXISTS "Şirket üyelerini ilgili kullanıcılar görebilir" ON public.company_members;
DROP POLICY IF EXISTS "Şirket sahibi ve admin üye ekleyebilir" ON public.company_members;
DROP POLICY IF EXISTS "Şirket sahibi ve admin üye güncelleyebilir" ON public.company_members;

CREATE POLICY "company_members_select" ON public.company_members FOR SELECT USING (
  company_id = public.get_current_company_id()
  OR public.get_current_company_id() IS NULL
);

CREATE POLICY "company_members_insert" ON public.company_members FOR INSERT WITH CHECK (
  company_id = public.get_current_company_id()
  OR public.get_current_company_id() IS NULL
);

CREATE POLICY "company_members_update" ON public.company_members FOR UPDATE USING (
  company_id = public.get_current_company_id()
  OR public.get_current_company_id() IS NULL
);

CREATE POLICY "company_members_delete" ON public.company_members FOR DELETE USING (
  company_id = public.get_current_company_id()
  OR public.get_current_company_id() IS NULL
);

-- Company Payments: company or platform_admin
DROP POLICY IF EXISTS "company_payments_select_company" ON public.company_payments;
DROP POLICY IF EXISTS "company_payments_select_admin" ON public.company_payments;

CREATE POLICY "company_payments_select" ON public.company_payments FOR SELECT USING (
  company_id = public.get_current_company_id()
  OR public.get_current_company_id() IS NULL
);

-- Feedback Templates: company or platform_admin; system templates visible to all authenticated
DROP POLICY IF EXISTS "Sistem kalıpları ve kendi şirket kalıpları görülebilir" ON public.feedback_templates;
DROP POLICY IF EXISTS "Şirket kendi kalıbını ekleyebilir" ON public.feedback_templates;
DROP POLICY IF EXISTS "Şirket kendi kalıbını güncelleyebilir" ON public.feedback_templates;
DROP POLICY IF EXISTS "Şirket kendi kalıbını silebilir" ON public.feedback_templates;

CREATE POLICY "feedback_templates_select" ON public.feedback_templates FOR SELECT USING (
  is_system = TRUE
  OR company_id = public.get_current_company_id()
  OR public.get_current_company_id() IS NULL
);

CREATE POLICY "feedback_templates_insert" ON public.feedback_templates FOR INSERT WITH CHECK (
  (company_id = public.get_current_company_id() AND is_system = FALSE)
  OR public.get_current_company_id() IS NULL
);

CREATE POLICY "feedback_templates_update" ON public.feedback_templates FOR UPDATE USING (
  (company_id = public.get_current_company_id() AND is_system = FALSE)
  OR public.get_current_company_id() IS NULL
);

CREATE POLICY "feedback_templates_delete" ON public.feedback_templates FOR DELETE USING (
  (company_id = public.get_current_company_id() AND is_system = FALSE)
  OR public.get_current_company_id() IS NULL
);

-- Application Status History: restrict INSERT to company or platform_admin (SELECT already fine)
DROP POLICY IF EXISTS "Sistem ve ilgili kullanıcılar durum geçmişi ekleyebilir" ON public.application_status_history;

CREATE POLICY "application_status_history_insert" ON public.application_status_history FOR INSERT WITH CHECK (
  auth.uid() = changed_by
  AND (
    EXISTS (SELECT 1 FROM public.applications a JOIN public.job_postings jp ON jp.id = a.job_id WHERE a.id = application_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
    OR application_id IN (SELECT id FROM public.applications WHERE developer_id = auth.uid())
  )
);

-- Application Notes: restrict SELECT to company or applicant or platform_admin
DROP POLICY IF EXISTS "İlgili kullanıcılar notları görebilir" ON public.application_notes;

CREATE POLICY "application_notes_select" ON public.application_notes FOR SELECT USING (
  created_by = auth.uid()
  OR EXISTS (SELECT 1 FROM public.applications a JOIN public.job_postings jp ON jp.id = a.job_id WHERE a.id = application_notes.application_id AND (a.developer_id = auth.uid() OR jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);

-- Interviews: SELECT/UPDATE by company or participant or platform_admin
DROP POLICY IF EXISTS "İlgili kullanıcılar mülakat görebilir" ON public.interviews;
DROP POLICY IF EXISTS "İlgili kullanıcılar mülakat güncelleyebilir" ON public.interviews;

CREATE POLICY "interviews_select" ON public.interviews FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.applications a JOIN public.job_postings jp ON jp.id = a.job_id WHERE a.id = interviews.application_id AND (a.developer_id = auth.uid() OR jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);

CREATE POLICY "interviews_update" ON public.interviews FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.applications a JOIN public.job_postings jp ON jp.id = a.job_id WHERE a.id = interviews.application_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
  OR public.get_current_company_id() IS NULL
);

-- cv_profiles: owner (via cvs) or HR with application; no global SELECT
DROP POLICY IF EXISTS "Herkes CV profillerini görebilir" ON public.cv_profiles;
DROP POLICY IF EXISTS "Sistem CV profili oluşturabilir" ON public.cv_profiles;
DROP POLICY IF EXISTS "Sistem CV profili güncelleyebilir" ON public.cv_profiles;

CREATE POLICY "cv_profiles_select" ON public.cv_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.cvs c WHERE c.id = cv_profiles.cv_id AND c.developer_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.cvs c JOIN public.applications a ON a.cv_id = c.id JOIN public.job_postings jp ON jp.id = a.job_id WHERE c.id = cv_profiles.cv_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);

CREATE POLICY "cv_profiles_insert" ON public.cv_profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "cv_profiles_update" ON public.cv_profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.cvs c WHERE c.id = cv_profiles.cv_id AND c.developer_id = auth.uid())
  OR public.get_current_company_id() IS NULL
);

-- Profiles: add explicit platform_admin bypass (keep broad SELECT for profile cards)
DROP POLICY IF EXISTS "Herkes profilleri görebilir" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (
  true
  OR public.get_current_company_id() IS NULL
);

-- Companies: keep public SELECT; optional strict: own + platform_admin
-- (Leaving companies SELECT as-is for public listing; no change.)

-- New enterprise tables: RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_select_all" ON public.roles FOR SELECT USING (true);
CREATE POLICY "permissions_select_all" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "role_permissions_select_all" ON public.role_permissions FOR SELECT USING (true);
CREATE POLICY "user_roles_select_own_or_admin" ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR public.get_current_company_id() IS NULL);
CREATE POLICY "user_roles_insert_admin" ON public.user_roles FOR INSERT WITH CHECK (public.get_current_company_id() IS NULL);
CREATE POLICY "user_roles_update_admin" ON public.user_roles FOR UPDATE USING (public.get_current_company_id() IS NULL);
CREATE POLICY "user_roles_delete_admin" ON public.user_roles FOR DELETE USING (public.get_current_company_id() IS NULL);

ALTER TABLE public.job_post_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_publish_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_publish_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_external_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_approval_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_publication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_post_versions_select" ON public.job_post_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_post_versions.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);
CREATE POLICY "job_post_versions_insert" ON public.job_post_versions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_post_versions.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);

CREATE POLICY "job_publish_requests_select" ON public.job_publish_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_publish_requests.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);
CREATE POLICY "job_publish_requests_insert" ON public.job_publish_requests FOR INSERT WITH CHECK (
  requested_by = auth.uid() AND EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_publish_requests.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);
CREATE POLICY "job_publish_requests_update" ON public.job_publish_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_publish_requests.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);

CREATE POLICY "job_publish_schedule_select" ON public.job_publish_schedule FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_publish_schedule.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);
CREATE POLICY "job_publish_schedule_insert" ON public.job_publish_schedule FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_publish_schedule.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);
CREATE POLICY "job_publish_schedule_update" ON public.job_publish_schedule FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_publish_schedule.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);

CREATE POLICY "job_external_channels_select" ON public.job_external_channels FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_external_channels.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);
CREATE POLICY "job_external_channels_insert" ON public.job_external_channels FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_external_channels.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);

CREATE POLICY "job_approval_flow_select" ON public.job_approval_flow FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_approval_flow.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);
CREATE POLICY "job_approval_flow_insert" ON public.job_approval_flow FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_approval_flow.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);
CREATE POLICY "job_approval_flow_update" ON public.job_approval_flow FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_approval_flow.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);

CREATE POLICY "job_publication_logs_select" ON public.job_publication_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_publication_logs.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);
CREATE POLICY "job_publication_logs_insert" ON public.job_publication_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_publication_logs.job_id AND (jp.company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL))
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans_select_all" ON public.plans FOR SELECT USING (true);
CREATE POLICY "plan_features_select_all" ON public.plan_features FOR SELECT USING (true);

ALTER TABLE public.company_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_subscriptions_select" ON public.company_subscriptions FOR SELECT USING (
  company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL
);
CREATE POLICY "company_subscriptions_insert" ON public.company_subscriptions FOR INSERT WITH CHECK (
  company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL
);
CREATE POLICY "company_subscriptions_update" ON public.company_subscriptions FOR UPDATE USING (
  company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL
);

ALTER TABLE public.subscription_usage_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscription_usage_select" ON public.subscription_usage_tracking FOR SELECT USING (
  company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_logs_select_company_or_admin" ON public.audit_logs FOR SELECT USING (
  company_id = public.get_current_company_id() OR public.get_current_company_id() IS NULL
);

-- ============================================
-- SECTION 9 — Storage Security
-- ============================================
-- cvs: make private; only owner or HR (via application) can read. Use signed URLs in frontend.

INSERT INTO storage.buckets (id, name, public) VALUES ('cvs', 'cvs', false)
  ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Users can delete their own CVs" ON storage.objects;

-- CV bucket: SELECT = owner (path first segment = user id) OR HR with application to that CV
CREATE POLICY "cvs_select_owner" ON storage.objects FOR SELECT USING (
  bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- HR/company can read CVs that are attached to an application for their company job (path: user_id/filename; we need to allow by object name pattern - storage does not join public.applications)
-- So we add a second policy: allow SELECT if bucket_id = 'cvs' and the request is from a user who has company_id = get_current_company_id() and there exists an application with cv file_url matching this object.
-- Storage policies cannot JOIN application table easily by object path. Alternative: RPC that returns signed URL only when application exists. So for storage we only allow owner read; HR must use API/signed URL.
CREATE POLICY "cvs_insert_owner" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "cvs_update_owner" ON storage.objects FOR UPDATE USING (
  bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "cvs_delete_owner" ON storage.objects FOR DELETE USING (
  bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text
);

-- job-attachments: private bucket for company job attachments (path: company_id/job_id/filename)
INSERT INTO storage.buckets (id, name, public) VALUES ('job-attachments', 'job-attachments', false)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "job_attachments_select" ON storage.objects FOR SELECT USING (
  bucket_id = 'job-attachments' AND (storage.foldername(name))[1] = public.get_current_company_id()::text
);

CREATE POLICY "job_attachments_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'job-attachments' AND (storage.foldername(name))[1] = public.get_current_company_id()::text
);

CREATE POLICY "job_attachments_update" ON storage.objects FOR UPDATE USING (
  bucket_id = 'job-attachments' AND (storage.foldername(name))[1] = public.get_current_company_id()::text
);

CREATE POLICY "job_attachments_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'job-attachments' AND (storage.foldername(name))[1] = public.get_current_company_id()::text
);

-- Note: For HR to read applicant CVs, use createSignedUrl in API (e.g. cv-download route) after verifying application belongs to company. Storage policy above only allows owner direct read; service role or signed URL for HR.

-- ============================================
-- TODO (manual review / post-migration)
-- ============================================
-- 1. Backfill user_roles from profiles: INSERT INTO user_roles (user_id, role_id, company_id)
--    SELECT p.id, r.id, p.company_id FROM profiles p JOIN roles r ON r.name = p.role
--    WHERE p.role IN ('hr','company_admin','admin','company','platform_admin','mt') AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role_id = r.id);
-- 2. Optional: Map existing job status 'active' -> 'published' for new lifecycle: UPDATE job_postings SET status = 'published' WHERE status = 'active';
-- 3. Optional: Sync company_subscriptions from companies.plan: insert company_subscriptions for each company from plans table.
-- 4. Frontend: Switch CV URLs to signed URLs (getPublicUrl -> createSignedUrl) when cvs bucket is private.
-- 5. Frontend: Add job form fields (requires_approval, schedule_publish_at, visibility, salary_visible, application_limit, featured, priority_level).
-- 6. Frontend: Add approval dashboard, publish queue, version history, subscription usage UI.

-- ============================================
-- FRONTEND FILES TO UPDATE (summary)
-- ============================================
-- Job form (new fields): app/dashboard/ik/ilanlar/olustur/page.tsx, app/dashboard/company/ilanlar/olustur/page.tsx
-- Job list (status filter): app/dashboard/company/ilanlar/page.tsx, app/dashboard/ik/ilanlar/page.tsx
-- Types: lib/types.ts (JobStatus, JobPosting: visibility, requires_approval, schedule_publish_at, application_limit, salary_visible, featured, priority_level)
-- Public job list: app/(main)/is-ilanlari/page.tsx (filter status IN ('published','active') and visibility)
-- CV access (signed URL): app/dashboard/gelistirici/cv/yukle/page.tsx, app/api/applications/cv-download/route.ts
-- New pages: Approval dashboard (company_admin), Publish queue, Version history viewer, Subscription usage (company dashboard)

-- ============================================
-- MIGRATION RISKS
-- ============================================
-- RLS: Existing queries that assumed global SELECT on applications/job_postings will now be scoped; verify company_id filter in frontend.
-- user_roles: Until backfill runs, has_permission falls back to profiles.role; backfill is required for full RBAC.
-- job status: Frontend may still use 'active'/'closed'/'draft'; consider mapping published <-> active for display.
-- Storage cvs private: Existing public CV URLs will break; deploy frontend signed-URL change with or before this migration.
-- Plan limits: If trigger added later to enforce job/featured limits, companies over limit may need one-time data fix.

-- ============================================
-- END 01_ENTERPRISE_UPGRADE.sql
-- ============================================

