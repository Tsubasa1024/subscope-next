CREATE TABLE IF NOT EXISTS public.article_views (
  id         uuid primary key default uuid_generate_v4(),
  article_id text not null,
  viewed_at  timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS idx_article_views_article ON public.article_views(article_id);

-- RLS
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "article_views_select" ON public.article_views FOR SELECT USING (true);
CREATE POLICY "article_views_insert" ON public.article_views FOR INSERT WITH CHECK (true);
