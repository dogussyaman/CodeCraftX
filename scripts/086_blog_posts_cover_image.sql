-- ============================================
-- 086: blog_posts kapak görseli (cover_image_url)
-- CodeCrafters - Blog listesi ve yazı sayfasında gösterim için.
-- 079_blog_tables.sql sonrası çalıştırın.
-- ============================================

ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
