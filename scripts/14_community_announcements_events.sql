-- Community announcements (admin/mt) and events
-- Run after 00_FINAL_ALL_IN_ONE.sql (profiles must exist).

-- community_announcements: duyurular
CREATE TABLE IF NOT EXISTS public.community_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_announcements_status ON public.community_announcements(status);
CREATE INDEX IF NOT EXISTS idx_community_announcements_created_at ON public.community_announcements(created_at DESC);

ALTER TABLE public.community_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published announcements"
  ON public.community_announcements FOR SELECT
  USING (status = 'published' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));

CREATE POLICY "Admin and MT can insert announcements"
  ON public.community_announcements FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));

CREATE POLICY "Admin and MT can update announcements"
  ON public.community_announcements FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));

CREATE POLICY "Admin and MT can delete announcements"
  ON public.community_announcements FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));

-- community_events: etkinlikler
CREATE TABLE IF NOT EXISTS public.community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published'))
);

CREATE INDEX IF NOT EXISTS idx_community_events_status ON public.community_events(status);
CREATE INDEX IF NOT EXISTS idx_community_events_starts_at ON public.community_events(starts_at) WHERE status = 'published';

ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published events"
  ON public.community_events FOR SELECT
  USING (status = 'published' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));

CREATE POLICY "Admin and MT can insert events"
  ON public.community_events FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));

CREATE POLICY "Admin and MT can update events"
  ON public.community_events FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));

CREATE POLICY "Admin and MT can delete events"
  ON public.community_events FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));

-- updated_at trigger (reuse if exists; use different $tag for nested body)
DO $outer$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $body$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $body$ LANGUAGE plpgsql;
  END IF;
END $outer$;

DROP TRIGGER IF EXISTS set_updated_at ON public.community_announcements;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.community_announcements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.community_events;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.community_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
