-- Community members (join) and topics (konular)
-- Run after 14_community_announcements_events.sql.

-- community_members: topluluğa katılma
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member')),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON public.community_members(user_id);

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read community members"
  ON public.community_members FOR SELECT USING (true);

CREATE POLICY "User can join (insert own row)"
  ON public.community_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User can leave (delete own row)"
  ON public.community_members FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin and MT can delete any member"
  ON public.community_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));

-- community_topics: konular (Duyurular, Frontend, Backend, ...)
CREATE TABLE IF NOT EXISTS public.community_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_topics_sort ON public.community_topics(sort_order);

ALTER TABLE public.community_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read topics"
  ON public.community_topics FOR SELECT USING (true);

CREATE POLICY "Admin and MT can insert topics"
  ON public.community_topics FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));

CREATE POLICY "Admin and MT can update topics"
  ON public.community_topics FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));

CREATE POLICY "Admin and MT can delete topics"
  ON public.community_topics FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin', 'mt')));

-- Seed default topics (idempotent)
INSERT INTO public.community_topics (slug, label, sort_order)
VALUES
  ('duyurular', 'Duyurular', 0),
  ('frontend', 'Frontend', 1),
  ('backend', 'Backend', 2),
  ('kariyer', 'Kariyer', 3),
  ('open-source', 'Open Source', 4)
ON CONFLICT (slug) DO NOTHING;
