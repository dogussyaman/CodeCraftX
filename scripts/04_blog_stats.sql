-- Blog post stats: view_count and like_count for developer dashboard
-- Migration order: run this before 06_increment_blog_post_view.sql (blog view counting depends on view_count column).
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS like_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.blog_posts.view_count IS 'Total number of page views for this post';
COMMENT ON COLUMN public.blog_posts.like_count IS 'Total number of likes (denormalized for display)';
