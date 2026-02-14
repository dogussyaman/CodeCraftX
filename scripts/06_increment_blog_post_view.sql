-- Görüntülenme sayısı artırma: RLS bypass (ziyaretçi herkes çağırabilir)
-- Migration order: run 04_blog_stats.sql first (adds view_count column), then this script.
CREATE OR REPLACE FUNCTION public.increment_blog_post_view(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.blog_posts
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_post_id
    AND status = 'published';
END;
$$;

COMMENT ON FUNCTION public.increment_blog_post_view(UUID) IS 'Increments view_count for a published post; callable by anyone (SECURITY DEFINER).';

-- RPC'yi herkese aç (anon + authenticated)
GRANT EXECUTE ON FUNCTION public.increment_blog_post_view(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_blog_post_view(UUID) TO authenticated;
