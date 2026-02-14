-- ============================================
-- CodeCraftX Platform - TEK FİNAL ŞEMA
-- Tüm migrasyonlar (050-089 + MT) bu dosyada birleştirildi.
-- Gereksiz tekrarlar kaldırıldı. Supabase SQL Editor'da tek seferde çalıştırın.
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ANA TABLOLAR
-- ============================================

-- Profiles (role: mt dahil)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('developer', 'hr', 'admin', 'company', 'company_admin', 'platform_admin', 'mt')),
  bio TEXT,
  title TEXT,
  social_links JSONB DEFAULT '{}',
  website TEXT,
  avatar_url TEXT,
  profile_bg_url TEXT,
  company_id UUID,
  must_change_password BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_bg_url TEXT;

-- Companies (plan dahil)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  website TEXT,
  logo_url TEXT,
  location TEXT,
  employee_count TEXT,
  legal_title TEXT,
  tax_number TEXT,
  tax_office TEXT,
  tax_certificate_url TEXT,
  address TEXT,
  phone TEXT,
  contact_email TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'orta', 'premium')),
  created_by UUID REFERENCES public.profiles(id),
  owner_profile_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_company_fkey;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_company_fkey
  FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  title TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  department TEXT,
  employee_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job postings (requirements sonradan nullable yapılacak; çokdilli kolonlar ALTER ile)
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  location TEXT,
  department TEXT,
  employment_type TEXT,
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')),
  experience_level TEXT CHECK (experience_level IN ('junior', 'mid', 'senior', 'lead')),
  salary_min INTEGER,
  salary_max INTEGER,
  application_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT CHECK (category IN ('programming', 'framework', 'tool', 'soft-skill', 'language', 'other')) DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT TRUE,
  proficiency_level TEXT CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
  UNIQUE(job_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.developer_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency_level TEXT CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
  years_of_experience DECIMAL(3,1),
  source TEXT DEFAULT 'manual' CHECK (source IN ('cv', 'manual', 'verified')),
  UNIQUE(developer_id, skill_id)
);

-- CVs (raw_text AI matching için)
CREATE TABLE IF NOT EXISTS public.cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  raw_text TEXT,
  parsed_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.educations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  school_name TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE NOT NULL,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  developer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  matching_skills JSONB,
  missing_skills JSONB,
  status TEXT DEFAULT 'suggested' CHECK (status IN ('suggested', 'viewed', 'contacted', 'rejected', 'hired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, developer_id)
);

-- Applications (match_score, match_reason AI için)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  developer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  cv_id UUID REFERENCES public.cvs(id) ON DELETE SET NULL,
  cover_letter TEXT,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  match_reason TEXT,
  status TEXT DEFAULT 'yeni' CHECK (status IN ('yeni', 'değerlendiriliyor', 'randevu', 'teklif', 'red', 'pending', 'reviewed', 'interview', 'rejected', 'accepted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, developer_id)
);

CREATE TABLE IF NOT EXISTS public.application_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES public.profiles(id),
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'reassigned', 'completed')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  changed_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.application_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('internal', 'evaluation', 'interview', 'general')),
  title TEXT,
  content TEXT NOT NULL,
  is_visible_to_developer BOOLEAN DEFAULT FALSE,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  scheduled_by UUID NOT NULL REFERENCES public.profiles(id),
  interview_type TEXT DEFAULT 'phone' CHECK (interview_type IN ('phone', 'video', 'onsite', 'technical', 'hr')),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  interviewers JSONB,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  href TEXT,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects (inspired_by dahil)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  technologies JSONB NOT NULL DEFAULT '[]',
  github_url TEXT,
  demo_url TEXT,
  image_url TEXT,
  stars INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  category TEXT,
  inspired_by TEXT,
  created_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email queue (ticket_resolved dahil)
CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  email_type TEXT NOT NULL CHECK (email_type IN ('company_created', 'hr_invited', 'password_reset', 'notification', 'custom', 'ticket_resolved')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.project_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'responded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.training_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  description TEXT NOT NULL,
  preferred_format TEXT CHECK (preferred_format IN ('online', 'offline', 'hybrid')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_role TEXT NOT NULL CHECK (requested_role IN ('hr', 'admin')),
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company requests (contact_*, plan ALTER ile eklenir)
CREATE TABLE IF NOT EXISTS public.company_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_website TEXT,
  company_description TEXT,
  company_size TEXT,
  industry TEXT,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.platform_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL UNIQUE,
  total_users INTEGER DEFAULT 0,
  total_developers INTEGER DEFAULT 0,
  total_hr_users INTEGER DEFAULT 0,
  total_companies INTEGER DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  total_applications INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EK TABLOLAR (050-089)
-- ============================================

-- Support tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  type TEXT CHECK (type IN ('login_error', 'feedback', 'technical', 'other')),
  subject TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_no TEXT,
  attachment_urls TEXT[] DEFAULT '{}'
);

-- CV profiles (AI)
CREATE TABLE IF NOT EXISTS public.cv_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID NOT NULL REFERENCES public.cvs(id) ON DELETE CASCADE,
  skills JSONB DEFAULT '[]'::jsonb,
  experience_years INTEGER,
  roles JSONB DEFAULT '[]'::jsonb,
  seniority TEXT CHECK (seniority IN ('junior', 'mid', 'senior')),
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cv_id)
);

-- Chat
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  support_ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE SET NULL,
  participant_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mt_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_urls TEXT[] DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  source TEXT
);

CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT,
  body_html TEXT,
  links JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Project join requests
CREATE TABLE IF NOT EXISTS public.project_join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(project_id, user_id)
);

-- Blog
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  body TEXT NOT NULL,
  cover_image_url TEXT,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('pending', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ALTER TABLE (mevcut tablolara kolon ekleme)
-- ============================================

-- companies.plan: eski şemada yoksa ekle
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.companies'::regclass AND conname = 'companies_plan_check') THEN
    ALTER TABLE public.companies ADD CONSTRAINT companies_plan_check CHECK (plan IN ('free', 'orta', 'premium'));
  END IF; END $$;

ALTER TABLE public.company_requests
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_address TEXT,
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.company_requests'::regclass AND conname = 'company_requests_plan_check') THEN
    ALTER TABLE public.company_requests ADD CONSTRAINT company_requests_plan_check CHECK (plan IN ('free', 'orta', 'premium'));
  END IF; END $$;

ALTER TABLE public.cvs ADD COLUMN IF NOT EXISTS raw_text TEXT;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS match_score INTEGER,
  ADD COLUMN IF NOT EXISTS match_reason TEXT;

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS inspired_by TEXT;

ALTER TABLE public.job_postings
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS work_preference TEXT,
  ADD COLUMN IF NOT EXISTS work_preference_list JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_de TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_de TEXT,
  ADD COLUMN IF NOT EXISTS requirements_tr JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS requirements_en JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS requirements_de JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS requirements_title_tr TEXT,
  ADD COLUMN IF NOT EXISTS requirements_title_en TEXT,
  ADD COLUMN IF NOT EXISTS requirements_title_de TEXT,
  ADD COLUMN IF NOT EXISTS requirements_subtitle_tr TEXT,
  ADD COLUMN IF NOT EXISTS requirements_subtitle_en TEXT,
  ADD COLUMN IF NOT EXISTS requirements_subtitle_de TEXT,
  ADD COLUMN IF NOT EXISTS candidate_criteria_tr JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS candidate_criteria_en JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS candidate_criteria_de JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS candidate_criteria_title_tr TEXT,
  ADD COLUMN IF NOT EXISTS candidate_criteria_title_en TEXT,
  ADD COLUMN IF NOT EXISTS candidate_criteria_title_de TEXT,
  ADD COLUMN IF NOT EXISTS responsibilities_tr JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS responsibilities_en JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS responsibilities_de JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ask_expected_salary BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS expected_salary_required BOOLEAN DEFAULT FALSE;
ALTER TABLE public.job_postings ALTER COLUMN requirements DROP NOT NULL;
ALTER TABLE public.job_postings DROP CONSTRAINT IF EXISTS chk_expected_salary_implies_ask;
ALTER TABLE public.job_postings ADD CONSTRAINT chk_expected_salary_implies_ask CHECK (
  (ask_expected_salary = FALSE AND expected_salary_required = FALSE) OR (ask_expected_salary = TRUE)
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.chat_messages'::regclass AND conname = 'chat_messages_attachment_urls_max_5') THEN
    ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_attachment_urls_max_5
      CHECK (array_length(attachment_urls, 1) IS NULL OR array_length(attachment_urls, 1) <= 5);
  END IF; END $$;

-- email_queue CHECK güncelle (ticket_resolved)
DO $$
DECLARE conname text;
BEGIN
  SELECT c.conname INTO conname FROM pg_constraint c
  WHERE c.conrelid = 'public.email_queue'::regclass AND c.contype = 'c' AND pg_get_constraintdef(c.oid) LIKE '%email_type%';
  IF conname IS NOT NULL THEN EXECUTE format('ALTER TABLE public.email_queue DROP CONSTRAINT %I', conname); END IF;
  ALTER TABLE public.email_queue ADD CONSTRAINT email_queue_email_type_check
    CHECK (email_type IN ('company_created', 'hr_invited', 'password_reset', 'notification', 'custom', 'ticket_resolved'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON public.job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_company ON public.job_postings(company_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_country ON public.job_postings(country) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_job_postings_city ON public.job_postings(city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_job_postings_district ON public.job_postings(district) WHERE district IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_job_postings_work_preference ON public.job_postings(work_preference) WHERE work_preference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_job_postings_work_preference_list ON public.job_postings USING GIN (work_preference_list);
CREATE INDEX IF NOT EXISTS idx_cvs_developer ON public.cvs(developer_id);
CREATE INDEX IF NOT EXISTS idx_developer_skills_developer ON public.developer_skills(developer_id);
CREATE INDEX IF NOT EXISTS idx_cv_profiles_cv_id ON public.cv_profiles(cv_id);
CREATE INDEX IF NOT EXISTS idx_applications_match_score ON public.applications(match_score) WHERE match_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_matches_job ON public.matches(job_id);
CREATE INDEX IF NOT EXISTS idx_matches_developer ON public.matches(developer_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_developer ON public.applications(developer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_application_assignments_application ON public.application_assignments(application_id);
CREATE INDEX IF NOT EXISTS idx_application_assignments_assigned_to ON public.application_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_interviews_application ON public.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON public.email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_participant ON public.chat_conversations(participant_user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_mt_user ON public.chat_conversations(mt_user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON public.chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_project_join_requests_project ON public.project_join_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_project_join_requests_user ON public.project_join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_project_join_requests_status ON public.project_join_requests(project_id, status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_comments_post ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent ON public.blog_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_user ON public.testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_status ON public.testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_created ON public.testimonials(created_at DESC);

-- ============================================
-- FONKSİYONLAR
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Kullanıcı'), COALESCE(NEW.raw_user_meta_data->>'role', 'developer'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.broadcast_notification(
  p_title TEXT, p_body TEXT DEFAULT NULL, p_href TEXT DEFAULT NULL,
  p_target_role TEXT DEFAULT 'all', p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_effective_role TEXT; v_inserted_count INTEGER := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin')) THEN
    RAISE EXCEPTION 'Sadece admin kullanıcılar toplu bildirim gönderebilir';
  END IF;
  v_effective_role := lower(coalesce(p_target_role, 'all'));
  IF v_effective_role = 'all' THEN
    INSERT INTO public.notifications (recipient_id, actor_id, type, title, body, href, data)
    SELECT p.id, auth.uid(), 'system', p_title, p_body, p_href, coalesce(p_data, '{}'::jsonb) FROM public.profiles p;
  ELSE
    INSERT INTO public.notifications (recipient_id, actor_id, type, title, body, href, data)
    SELECT p.id, auth.uid(), 'system', p_title, p_body, p_href, coalesce(p_data, '{}'::jsonb)
    FROM public.profiles p WHERE lower(p.role) = v_effective_role;
  END IF;
  GET DIAGNOSTICS v_inserted_count = ROW_COUNT;
  RETURN v_inserted_count;
END; $$;

-- create_company_with_owner (plan param + MT yetkisi)
CREATE OR REPLACE FUNCTION public.create_company_with_owner(
  company_name TEXT, company_email TEXT, owner_full_name TEXT, owner_user_id UUID, temp_password TEXT,
  created_by_admin_id UUID DEFAULT NULL, company_description TEXT DEFAULT NULL, company_industry TEXT DEFAULT NULL,
  company_website TEXT DEFAULT NULL, company_location TEXT DEFAULT NULL, company_employee_count TEXT DEFAULT NULL,
  company_legal_title TEXT DEFAULT NULL, company_tax_number TEXT DEFAULT NULL, company_tax_office TEXT DEFAULT NULL,
  company_address TEXT DEFAULT NULL, company_phone TEXT DEFAULT NULL, company_contact_email TEXT DEFAULT NULL,
  p_plan TEXT DEFAULT 'free'
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_company_id UUID; result JSONB; plan_value TEXT := COALESCE(NULLIF(TRIM(p_plan), ''), 'free');
BEGIN
  IF plan_value NOT IN ('free', 'orta', 'premium') THEN plan_value := 'free'; END IF;
  IF created_by_admin_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = created_by_admin_id AND role IN ('admin', 'platform_admin', 'mt')) THEN
      RAISE EXCEPTION 'Sadece admin veya MT kullanıcılar şirket oluşturabilir';
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = owner_user_id) THEN
    INSERT INTO public.profiles (id, email, full_name, role, must_change_password, company_id)
    VALUES (owner_user_id, company_email, owner_full_name, 'company_admin', TRUE, NULL)
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, role = EXCLUDED.role, must_change_password = TRUE;
  ELSE
    UPDATE public.profiles SET email = company_email, full_name = owner_full_name, role = 'company_admin', must_change_password = TRUE WHERE id = owner_user_id;
  END IF;
  INSERT INTO public.companies (name, description, industry, website, location, employee_count, legal_title, tax_number, tax_office, address, phone, contact_email, plan, created_by, owner_profile_id)
  VALUES (company_name, company_description, company_industry, company_website, company_location, company_employee_count, company_legal_title, company_tax_number, company_tax_office, company_address, company_phone, company_contact_email, plan_value, created_by_admin_id, owner_user_id)
  RETURNING id INTO new_company_id;
  UPDATE public.profiles SET company_id = new_company_id WHERE id = owner_user_id;
  INSERT INTO public.email_queue (recipient_email, recipient_name, subject, html_content, text_content, email_type, metadata)
  VALUES (company_email, owner_full_name, 'Codecrafters - Şirket Hesabınız Oluşturuldu',
    '<h1>Merhaba ' || owner_full_name || '</h1><p>Şirketiniz Codecrafters platformuna başarıyla kaydedildi.</p><p><strong>Giriş Bilgileriniz:</strong></p><p>E-posta: ' || company_email || '</p><p>Şifre: ' || temp_password || '</p><p><strong>ÖNEMLİ:</strong> İlk girişinizde şifrenizi değiştirmeniz gerekmektedir.</p>',
    'Merhaba ' || owner_full_name || E'\n\nŞirketiniz Codecrafters platformuna başarıyla kaydedildi.\n\nGiriş Bilgileriniz:\nE-posta: ' || company_email || E'\nŞifre: ' || temp_password || E'\n\nÖNEMLİ: İlk girişinizde şifrenizi değiştirmeniz gerekmektedir.',
    'company_created', jsonb_build_object('company_id', new_company_id, 'company_name', company_name, 'user_id', owner_user_id, 'temp_password', temp_password));
  result := jsonb_build_object('success', TRUE, 'company_id', new_company_id, 'owner_user_id', owner_user_id);
  RETURN result;
END; $$;

CREATE OR REPLACE FUNCTION public.create_hr_user(
  hr_email TEXT, hr_full_name TEXT, hr_user_id UUID, temp_password TEXT, company_id_param UUID, created_by_user_id UUID,
  hr_title TEXT DEFAULT NULL, hr_phone TEXT DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE company_owner_id UUID; result JSONB;
BEGIN
  SELECT owner_profile_id INTO company_owner_id FROM public.companies WHERE id = company_id_param;
  IF company_owner_id IS NULL THEN RAISE EXCEPTION 'Şirket bulunamadı'; END IF;
  IF created_by_user_id != company_owner_id AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = created_by_user_id AND role IN ('admin', 'platform_admin')) THEN
    RAISE EXCEPTION 'Sadece şirket sahibi veya admin İK kullanıcısı ekleyebilir';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = hr_user_id) THEN
    INSERT INTO public.profiles (id, email, full_name, role, phone, title, must_change_password, company_id)
    VALUES (hr_user_id, hr_email, hr_full_name, 'hr', hr_phone, hr_title, TRUE, company_id_param)
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, role = EXCLUDED.role, phone = EXCLUDED.phone, title = EXCLUDED.title, must_change_password = TRUE, company_id = EXCLUDED.company_id;
  ELSE
    UPDATE public.profiles SET email = hr_email, full_name = hr_full_name, role = 'hr', phone = hr_phone, title = hr_title, must_change_password = TRUE, company_id = company_id_param WHERE id = hr_user_id;
  END IF;
  INSERT INTO public.email_queue (recipient_email, recipient_name, subject, html_content, text_content, email_type, metadata)
  VALUES (hr_email, hr_full_name, 'Codecrafters - İK Hesabınız Oluşturuldu',
    '<h1>Merhaba ' || hr_full_name || '</h1><p>Codecrafters platformuna İK kullanıcısı olarak eklendiniz.</p><p><strong>Giriş Bilgileriniz:</strong></p><p>E-posta: ' || hr_email || '</p><p>Şifre: ' || temp_password || '</p><p><strong>ÖNEMLİ:</strong> İlk girişinizde şifrenizi değiştirmeniz gerekmektedir.</p>',
    'Merhaba ' || hr_full_name || E'\n\nCodecrafters platformuna İK kullanıcısı olarak eklendiniz.\n\nGiriş Bilgileriniz:\nE-posta: ' || hr_email || E'\nŞifre: ' || temp_password || E'\n\nÖNEMLİ: İlk girişinizde şifrenizi değiştirmeniz gerekmektedir.',
    'hr_invited', jsonb_build_object('company_id', company_id_param, 'user_id', hr_user_id, 'temp_password', temp_password));
  result := jsonb_build_object('success', TRUE, 'hr_user_id', hr_user_id);
  RETURN result;
END; $$;

-- Destek bileti çözüldüğünde bildirim + email
CREATE OR REPLACE FUNCTION public.on_support_ticket_resolved()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rec_recipient_id uuid; rec_email text; rec_name text; rec_role text; mail_subject text; mail_body text; mail_html text; href_val text;
BEGIN
  IF NEW.status NOT IN ('resolved', 'closed') OR OLD.status = NEW.status THEN RETURN NEW; END IF;
  rec_recipient_id := NEW.user_id; rec_email := NULL; rec_name := NULL; rec_role := NULL;
  IF rec_recipient_id IS NOT NULL THEN
    SELECT p.email, p.full_name, p.role INTO rec_email, rec_name, rec_role FROM public.profiles p WHERE p.id = rec_recipient_id;
  END IF;
  IF rec_email IS NULL OR rec_email = '' THEN rec_email := NULLIF(TRIM(NEW.email), ''); END IF;
  IF rec_recipient_id IS NOT NULL THEN
    href_val := CASE rec_role WHEN 'company' THEN '/dashboard/company/destek' WHEN 'hr' THEN '/dashboard/ik/destek' ELSE '/dashboard/gelistirici/destek' END;
    href_val := COALESCE(href_val, '/dashboard/gelistirici/destek');
    INSERT INTO public.notifications (recipient_id, type, title, body, href)
    VALUES (rec_recipient_id, 'support_ticket_resolved', 'Destek talebiniz çözüldü',
      COALESCE('Konu: ' || LEFT(NEW.subject, 100) || E'\n\n' || CASE WHEN NEW.resolution_no IS NOT NULL AND NEW.resolution_no <> '' THEN 'Çözüm notu: ' || LEFT(NEW.resolution_no, 300) ELSE 'Durum: ' || NEW.status END, 'Konu: ' || COALESCE(NEW.subject, 'Destek talebi')), href_val);
  END IF;
  IF rec_email IS NOT NULL AND NEW.type IN ('login_error', 'technical', 'other', 'feedback') THEN
    mail_subject := 'CodeCrafters – Destek talebiniz çözüldü: ' || COALESCE(LEFT(NEW.subject, 60), 'Destek talebi');
    mail_body := 'Merhaba,' || E'\n\nDestek talebiniz çözüldü veya kapatıldı.' || E'\n\nKonu: ' || COALESCE(NEW.subject, '') || E'\n\n' || CASE WHEN NEW.resolution_no IS NOT NULL AND NEW.resolution_no <> '' THEN 'Çözüm notu: ' || NEW.resolution_no || E'\n\n' ELSE '' END || 'Detaylar için giriş yapıp Destek Taleplerim sayfasına bakabilirsiniz.';
    mail_html := '<p>Merhaba,</p><p>Destek talebiniz çözüldü veya kapatıldı.</p><p><strong>Konu:</strong> ' || COALESCE(NEW.subject, '') || '</p>' || CASE WHEN NEW.resolution_no IS NOT NULL AND NEW.resolution_no <> '' THEN '<p><strong>Çözüm notu:</strong></p><p>' || NEW.resolution_no || '</p>' ELSE '' END || '<p>Detaylar için giriş yapıp Destek Taleplerim sayfasına bakabilirsiniz.</p>';
    INSERT INTO public.email_queue (recipient_email, recipient_name, subject, html_content, text_content, email_type, metadata)
    VALUES (rec_email, rec_name, mail_subject, mail_html, mail_body, 'ticket_resolved', jsonb_build_object('support_ticket_id', NEW.id, 'subject', NEW.subject, 'status', NEW.status));
  END IF;
  RETURN NEW;
END; $$;

-- ============================================
-- TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.job_postings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cvs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cover_letters FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.educations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.company_members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.application_assignments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.application_notes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.interviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.training_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.role_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.company_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at ON public.cv_profiles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.cv_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at ON public.support_tickets;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at ON public.chat_conversations;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS set_updated_at ON public.blog_posts;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS support_ticket_resolution_notify ON public.support_tickets;
CREATE TRIGGER support_ticket_resolution_notify AFTER UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.on_support_ticket_resolved();

-- ============================================
-- RLS: Tüm policy'leri kaldır, sonra yeniden oluştur
-- ============================================

DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes profilleri görebilir" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Kullanıcılar kendi profillerini oluşturabilir" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin profil oluşturabilir" ON public.profiles FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin')));
CREATE POLICY "Kullanıcılar kendi profillerini güncelleyebilir" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin profilleri güncelleyebilir" ON public.profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin')));

-- Companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes şirketleri görebilir" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Admin ve şirket sahibi şirket oluşturabilir" ON public.companies FOR INSERT WITH CHECK (auth.uid() = created_by OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin')));
CREATE POLICY "Şirket sahibi ve admin güncelleyebilir" ON public.companies FOR UPDATE USING (owner_profile_id = auth.uid() OR created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin')));

-- Job Postings
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes aktif ilanları görebilir" ON public.job_postings FOR SELECT USING (true);
CREATE POLICY "Kullanıcılar ilan oluşturabilir" ON public.job_postings FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "İlan sahibi güncelleyebilir" ON public.job_postings FOR UPDATE USING (created_by = auth.uid());

-- Skills, Developer Skills, Job Skills
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes yetenekleri görebilir" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Herkes yetenek ekleyebilir" ON public.skills FOR INSERT WITH CHECK (true);
ALTER TABLE public.developer_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes geliştirici yeteneklerini görebilir" ON public.developer_skills FOR SELECT USING (true);
CREATE POLICY "Geliştiriciler kendi yeteneklerini ekleyebilir" ON public.developer_skills FOR INSERT WITH CHECK (developer_id = auth.uid());
CREATE POLICY "Geliştiriciler kendi yeteneklerini güncelleyebilir" ON public.developer_skills FOR UPDATE USING (developer_id = auth.uid());
CREATE POLICY "Geliştiriciler kendi yeteneklerini silebilir" ON public.developer_skills FOR DELETE USING (developer_id = auth.uid());

-- CVs (kendi + İK başvuruya bağlı CV görebilir, DELETE dahil)
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kullanıcılar kendi CV'lerini görebilir" ON public.cvs FOR SELECT USING (developer_id = auth.uid());
CREATE POLICY "İK başvuruya bağlı CV'yi görebilir" ON public.cvs FOR SELECT USING (
  developer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.applications a JOIN public.job_postings jp ON jp.id = a.job_id JOIN public.profiles p ON p.id = auth.uid()
    WHERE a.cv_id = cvs.id AND jp.company_id = p.company_id AND p.role IN ('hr', 'company_admin', 'admin', 'platform_admin')
  )
);
CREATE POLICY "Geliştiriciler CV yükleyebilir" ON public.cvs FOR INSERT WITH CHECK (developer_id = auth.uid());
CREATE POLICY "Geliştiriciler kendi CV'lerini güncelleyebilir" ON public.cvs FOR UPDATE USING (developer_id = auth.uid());
CREATE POLICY "Geliştiriciler kendi CV'lerini silebilir" ON public.cvs FOR DELETE USING (developer_id = auth.uid());

-- cv_profiles
ALTER TABLE public.cv_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes CV profillerini görebilir" ON public.cv_profiles FOR SELECT USING (true);
CREATE POLICY "Sistem CV profili oluşturabilir" ON public.cv_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Sistem CV profili güncelleyebilir" ON public.cv_profiles FOR UPDATE USING (true);

-- Cover Letters, Experiences, Educations, Certificates
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kullanıcılar kendi ön yazılarını görebilir" ON public.cover_letters FOR SELECT USING (auth.uid() = developer_id);
CREATE POLICY "Kullanıcılar kendine ön yazı ekleyebilir" ON public.cover_letters FOR INSERT WITH CHECK (auth.uid() = developer_id);
CREATE POLICY "Kullanıcılar kendi ön yazılarını güncelleyebilir" ON public.cover_letters FOR UPDATE USING (auth.uid() = developer_id);
CREATE POLICY "Kullanıcılar kendi ön yazılarını silebilir" ON public.cover_letters FOR DELETE USING (auth.uid() = developer_id);
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deneyimleri herkes görebilir" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Kullanıcılar deneyim ekleyebilir" ON public.experiences FOR INSERT WITH CHECK (auth.uid() = developer_id);
CREATE POLICY "Kullanıcılar deneyimlerini güncelleyebilir" ON public.experiences FOR UPDATE USING (auth.uid() = developer_id);
CREATE POLICY "Kullanıcılar deneyimlerini silebilir" ON public.experiences FOR DELETE USING (auth.uid() = developer_id);
ALTER TABLE public.educations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Eğitimleri herkes görebilir" ON public.educations FOR SELECT USING (true);
CREATE POLICY "Kullanıcılar eğitim ekleyebilir" ON public.educations FOR INSERT WITH CHECK (auth.uid() = developer_id);
CREATE POLICY "Kullanıcılar eğitimlerini güncelleyebilir" ON public.educations FOR UPDATE USING (auth.uid() = developer_id);
CREATE POLICY "Kullanıcılar eğitimlerini silebilir" ON public.educations FOR DELETE USING (auth.uid() = developer_id);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sertifikaları herkes görebilir" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Kullanıcılar sertifika ekleyebilir" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = developer_id);
CREATE POLICY "Kullanıcılar sertifikalarını güncelleyebilir" ON public.certificates FOR UPDATE USING (auth.uid() = developer_id);
CREATE POLICY "Kullanıcılar sertifikalarını silebilir" ON public.certificates FOR DELETE USING (auth.uid() = developer_id);

-- Applications, Matches, Notifications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes başvuruları görebilir" ON public.applications FOR SELECT USING (true);
CREATE POLICY "Geliştiriciler başvuru yapabilir" ON public.applications FOR INSERT WITH CHECK (developer_id = auth.uid());
CREATE POLICY "İlgili kullanıcılar başvuru güncelleyebilir" ON public.applications FOR UPDATE USING (true);
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kullanıcılar eşleşmeleri görebilir" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Sistem eşleşme oluşturabilir" ON public.matches FOR INSERT WITH CHECK (true);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kullanıcılar kendi bildirimlerini görebilir" ON public.notifications FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Sistem bildirim oluşturabilir" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Kullanıcılar bildirimlerini güncelleyebilir" ON public.notifications FOR UPDATE USING (auth.uid() = recipient_id);
CREATE POLICY "Kullanıcılar bildirimlerini silebilir" ON public.notifications FOR DELETE USING (auth.uid() = recipient_id);

-- Projects (INSERT: sadece admin/developer/platform_admin)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes yayınlanan projeleri görebilir" ON public.projects FOR SELECT USING (status = 'published' OR created_by = auth.uid());
CREATE POLICY "Sadece admin ve geliştirici proje ekleyebilir" ON public.projects FOR INSERT WITH CHECK (
  auth.uid() = created_by AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'developer', 'platform_admin'))
);
CREATE POLICY "Kullanıcılar kendi projelerini güncelleyebilir" ON public.projects FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Kullanıcılar kendi projelerini silebilir" ON public.projects FOR DELETE USING (created_by = auth.uid());

-- Project join requests
ALTER TABLE public.project_join_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can view own join requests" ON public.project_join_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Project owner can view join requests" ON public.project_join_requests FOR SELECT USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_join_requests.project_id AND p.created_by = auth.uid()));
CREATE POLICY "Authenticated user can create join request" ON public.project_join_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Project owner can update join request status" ON public.project_join_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_join_requests.project_id AND p.created_by = auth.uid()));

-- Email Queue, Company Members, Job Skills, ATS, Project Likes, Contact, Training, Role/Company Requests
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin email kuyruğunu görebilir" ON public.email_queue FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin')));
CREATE POLICY "Sistem email ekleyebilir" ON public.email_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin email güncelleyebilir" ON public.email_queue FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin')));
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Şirket üyelerini ilgili kullanıcılar görebilir" ON public.company_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_members.company_id AND (c.owner_profile_id = auth.uid() OR c.created_by = auth.uid())) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
);
CREATE POLICY "Şirket sahibi ve admin üye ekleyebilir" ON public.company_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_members.company_id AND (c.owner_profile_id = auth.uid() OR c.created_by = auth.uid())) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
);
CREATE POLICY "Şirket sahibi ve admin üye güncelleyebilir" ON public.company_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies c WHERE c.id = company_members.company_id AND (c.owner_profile_id = auth.uid() OR c.created_by = auth.uid())) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
);
ALTER TABLE public.job_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes iş yeteneklerini görebilir" ON public.job_skills FOR SELECT USING (true);
CREATE POLICY "İlan sahibi yetenek ekleyebilir" ON public.job_skills FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_skills.job_id AND jp.created_by = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin')));
CREATE POLICY "İlan sahibi yetenek güncelleyebilir" ON public.job_skills FOR UPDATE USING (EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_skills.job_id AND jp.created_by = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin')));
CREATE POLICY "İlan sahibi yetenek silebilir" ON public.job_skills FOR DELETE USING (EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_skills.job_id AND jp.created_by = auth.uid()) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin')));
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "İlgili kullanıcılar durum geçmişini görebilir" ON public.application_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.applications a WHERE a.id = application_status_history.application_id AND (a.developer_id = auth.uid() OR a.job_id IN (SELECT jp.id FROM public.job_postings jp WHERE jp.company_id IN (SELECT c.id FROM public.companies c WHERE c.owner_profile_id = auth.uid() OR c.created_by = auth.uid())))) OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'hr'))
);
CREATE POLICY "Sistem ve ilgili kullanıcılar durum geçmişi ekleyebilir" ON public.application_status_history FOR INSERT WITH CHECK (true);
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes beğenileri görebilir" ON public.project_likes FOR SELECT USING (true);
CREATE POLICY "Kullanıcılar beğeni ekleyebilir" ON public.project_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar kendi beğenilerini silebilir" ON public.project_likes FOR DELETE USING (auth.uid() = user_id);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin mesajları görebilir" ON public.contact_messages FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin')));
CREATE POLICY "Herkes mesaj gönderebilir" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin mesajları güncelleyebilir" ON public.contact_messages FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin')));
ALTER TABLE public.training_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kullanıcılar kendi taleplerini görebilir" ON public.training_requests FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin')));
CREATE POLICY "Kullanıcılar talep oluşturabilir" ON public.training_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Kullanıcılar veya admin talepleri güncelleyebilir" ON public.training_requests FOR UPDATE USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin')));

-- Role Requests (MT dahil)
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kullanıcılar ve MT/Admin talepleri görebilir" ON public.role_requests FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'platform_admin', 'mt'))
);
CREATE POLICY "Kullanıcılar rol talebi oluşturabilir" ON public.role_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "MT ve Admin rol taleplerini güncelleyebilir" ON public.role_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'platform_admin', 'mt'))
);

-- Company Requests (MT dahil)
ALTER TABLE public.company_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kullanıcılar ve MT/Admin talepleri görebilir" ON public.company_requests FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'platform_admin', 'mt'))
);
CREATE POLICY "Kullanıcılar şirket talebi oluşturabilir" ON public.company_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "MT ve Admin şirket taleplerini güncelleyebilir" ON public.company_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'platform_admin', 'mt'))
);

-- ATS, Platform Stats
ALTER TABLE public.application_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "İlgili kullanıcılar atamaları görebilir" ON public.application_assignments FOR SELECT USING (assigned_to = auth.uid() OR assigned_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'hr')));
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "İlgili kullanıcılar notları görebilir" ON public.application_notes FOR SELECT USING (true);
CREATE POLICY "Kullanıcılar not ekleyebilir" ON public.application_notes FOR INSERT WITH CHECK (auth.uid() = created_by);
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "İlgili kullanıcılar mülakat görebilir" ON public.interviews FOR SELECT USING (true);
ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Herkes istatistikleri görebilir" ON public.platform_stats FOR SELECT USING (true);

-- Support tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "MT and admin can view all tickets" ON public.support_tickets FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('mt', 'admin', 'platform_admin'))
);
CREATE POLICY "Anyone can insert support ticket" ON public.support_tickets FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "MT and admin can update tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('mt', 'admin', 'platform_admin'))
);

-- Chat
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_conversations_select_participant" ON public.chat_conversations FOR SELECT TO authenticated USING (participant_user_id = auth.uid());
CREATE POLICY "chat_conversations_select_mt_admin" ON public.chat_conversations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('mt', 'admin', 'platform_admin')));
CREATE POLICY "chat_conversations_insert_participant" ON public.chat_conversations FOR INSERT TO authenticated WITH CHECK (participant_user_id = auth.uid());
CREATE POLICY "chat_conversations_insert_mt_admin" ON public.chat_conversations FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('mt', 'admin', 'platform_admin')));
CREATE POLICY "chat_conversations_update_mt_admin" ON public.chat_conversations FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('mt', 'admin', 'platform_admin')));
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_messages_select_participant" ON public.chat_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.chat_conversations c WHERE c.id = conversation_id AND (c.participant_user_id = auth.uid() OR c.mt_user_id = auth.uid()))
);
CREATE POLICY "chat_messages_select_mt_admin" ON public.chat_messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('mt', 'admin', 'platform_admin')));
CREATE POLICY "chat_messages_insert_participant" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.chat_conversations c WHERE c.id = conversation_id AND c.participant_user_id = auth.uid())
);
CREATE POLICY "chat_messages_insert_mt_admin" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (
  sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('mt', 'admin', 'platform_admin')) AND EXISTS (SELECT 1 FROM public.chat_conversations c WHERE c.id = conversation_id)
);
CREATE POLICY "chat_messages_update_read_at" ON public.chat_messages FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.chat_conversations c WHERE c.id = conversation_id AND (c.participant_user_id = auth.uid() OR c.mt_user_id = auth.uid()))
);

-- Newsletter
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe newsletter" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin and MT can view subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'mt', 'platform_admin')));
CREATE POLICY "Admin and MT can update subscribers" ON public.newsletter_subscribers FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'mt', 'platform_admin')));
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin and MT can manage campaigns" ON public.newsletter_campaigns FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'mt', 'platform_admin'))) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'mt', 'platform_admin')));

-- Blog
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published blog posts" ON public.blog_posts FOR SELECT USING (status = 'published' OR author_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));
CREATE POLICY "Author and admin can insert blog posts" ON public.blog_posts FOR INSERT WITH CHECK (author_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));
CREATE POLICY "Author and admin can update blog posts" ON public.blog_posts FOR UPDATE USING (author_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));
CREATE POLICY "Author and admin can delete blog posts" ON public.blog_posts FOR DELETE USING (author_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read blog comments" ON public.blog_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert blog comment" ON public.blog_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can delete own comment or admin" ON public.blog_comments FOR DELETE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));

-- Testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published or own testimonials" ON public.testimonials FOR SELECT USING (status = 'published' OR user_id = auth.uid());
CREATE POLICY "Authenticated can insert own testimonial" ON public.testimonials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update own testimonial" ON public.testimonials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "User or admin can delete testimonial" ON public.testimonials FOR DELETE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));

-- ============================================
-- STORAGE (buckets + policies)
-- ============================================

DROP POLICY IF EXISTS "Users can delete their own CVs" ON storage.objects;
CREATE POLICY "Users can delete their own CVs" ON storage.objects FOR DELETE USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

INSERT INTO storage.buckets (id, name, public) VALUES ('support-tickets', 'support-tickets', true) ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;
DROP POLICY IF EXISTS "support-tickets public read" ON storage.objects;
CREATE POLICY "support-tickets public read" ON storage.objects FOR SELECT USING (bucket_id = 'support-tickets');
DROP POLICY IF EXISTS "support-tickets insert" ON storage.objects;
CREATE POLICY "support-tickets insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'support-tickets');

INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', true) ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;
DROP POLICY IF EXISTS "chat-attachments public read" ON storage.objects;
CREATE POLICY "chat-attachments public read" ON storage.objects FOR SELECT USING (bucket_id = 'chat-attachments');
DROP POLICY IF EXISTS "chat-attachments insert" ON storage.objects;
CREATE POLICY "chat-attachments insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'chat-attachments');

INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true) ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;
DROP POLICY IF EXISTS "project-images public read" ON storage.objects;
CREATE POLICY "project-images public read" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
DROP POLICY IF EXISTS "project-images insert own folder" ON storage.objects;
CREATE POLICY "project-images insert own folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images' AND (storage.foldername(name))[1] = auth.uid()::text);
DROP POLICY IF EXISTS "project-images delete own" ON storage.objects;
CREATE POLICY "project-images delete own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-images' AND (storage.foldername(name))[1] = auth.uid()::text);

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
-- SEED (temel yetenekler + örnek blog + test projesi)
-- ============================================

INSERT INTO public.skills (name, category) VALUES
  ('JavaScript', 'programming'), ('TypeScript', 'programming'), ('Python', 'programming'), ('Java', 'programming'), ('C#', 'programming'), ('Go', 'programming'), ('Rust', 'programming'), ('PHP', 'programming'), ('Ruby', 'programming'), ('Swift', 'programming'), ('Kotlin', 'programming'),
  ('React', 'framework'), ('Next.js', 'framework'), ('Vue.js', 'framework'), ('Angular', 'framework'), ('Node.js', 'framework'), ('Express.js', 'framework'), ('Django', 'framework'), ('Flask', 'framework'), ('Spring Boot', 'framework'), ('.NET', 'framework'), ('Laravel', 'framework'), ('Ruby on Rails', 'framework'),
  ('Git', 'tool'), ('Docker', 'tool'), ('Kubernetes', 'tool'), ('AWS', 'tool'), ('Azure', 'tool'), ('Google Cloud', 'tool'), ('PostgreSQL', 'tool'), ('MongoDB', 'tool'), ('Redis', 'tool'), ('GraphQL', 'tool'), ('REST API', 'tool'), ('CI/CD', 'tool'),
  ('Problem Solving', 'soft-skill'), ('Team Collaboration', 'soft-skill'), ('Communication', 'soft-skill'), ('Leadership', 'soft-skill'), ('Agile/Scrum', 'soft-skill'),
  ('English', 'language'), ('Turkish', 'language'), ('German', 'language'), ('French', 'language')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.blog_posts (title, slug, body, author_id, status, published_at)
SELECT 'CodeCraftX ile Yazılım Kariyerinize Yön Verin', 'codecraftx-ile-yazilim-kariyerinize-yon-verin',
  'CodeCraftX, yazılım geliştiricileri ve işverenleri bir araya getiren modern bir kariyer platformudur. CV''nizi oluşturabilir, projelerinizi paylaşabilir, iş ilanlarına başvurabilirsiniz. Yapay zeka destekli eşleştirme ile yeteneklerinize uygun fırsatları keşfedin.',
  p.id, 'published', NOW()
FROM public.profiles p LIMIT 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.projects (title, description, long_description, technologies, github_url, demo_url, category, status, created_by)
SELECT 'Test Projesi', 'Veritabanı ve arayüz testi için örnek proje.', 'Bu kayıt test amaçlıdır.', '["SQL", "Test"]'::jsonb, 'https://github.com', 'https://example.com', 'Web', 'published', first_owner.id
FROM (SELECT id FROM public.profiles WHERE role IN ('developer', 'admin', 'platform_admin') LIMIT 1) first_owner
WHERE NOT EXISTS (SELECT 1 FROM public.projects WHERE title = 'Test Projesi');

-- ============================================
-- TAMAMLANDI
-- ============================================
