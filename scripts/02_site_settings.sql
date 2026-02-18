-- Site-wide settings (key-value). Used e.g. for default_theme_accent.
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Allow public read for site_settings (needed for default theme on landing).
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_select_all" ON public.site_settings
  FOR SELECT USING (true);

-- Only service role or backend with admin check should update (API uses service role after auth check).
INSERT INTO public.site_settings (key, value)
VALUES ('default_theme_accent', 'orange')
ON CONFLICT (key) DO NOTHING;
