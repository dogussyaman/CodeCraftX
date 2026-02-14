-- Blog post likes: one like per user per post (toggle)
CREATE TABLE IF NOT EXISTS public.blog_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_blog_post_likes_post ON public.blog_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_likes_user ON public.blog_post_likes(user_id);

ALTER TABLE public.blog_post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blog post likes" ON public.blog_post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert own like" ON public.blog_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can delete own like" ON public.blog_post_likes FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE public.blog_post_likes IS 'One row per user per post; like_count on blog_posts is denormalized.';
