-- ============================================
-- Newsletter: subscribers + campaigns
-- Footer bülten kayıt + Admin/MT bülten gönderimi
-- Supabase SQL Editor'da çalıştırın.
-- ============================================

-- Aboneler: herkes insert (kayıt), sadece admin/mt select
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  source TEXT
);

-- Bülten kampanyaları: admin ve mt insert/update/select
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

-- RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- newsletter_subscribers: herkes (anon + authenticated) insert
DROP POLICY IF EXISTS "Anyone can subscribe newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe newsletter"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- newsletter_subscribers: sadece admin/mt select
DROP POLICY IF EXISTS "Admin and MT can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admin and MT can view subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'mt', 'platform_admin')
    )
  );

-- newsletter_subscribers: admin/mt update (unsubscribe_at güncelleme vb.)
DROP POLICY IF EXISTS "Admin and MT can update subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admin and MT can update subscribers"
  ON public.newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'mt', 'platform_admin')
    )
  );

-- newsletter_campaigns: admin ve mt full access
DROP POLICY IF EXISTS "Admin and MT can manage campaigns" ON public.newsletter_campaigns;
CREATE POLICY "Admin and MT can manage campaigns"
  ON public.newsletter_campaigns
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'mt', 'platform_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'mt', 'platform_admin')
    )
  );
