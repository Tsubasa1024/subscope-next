-- ============================================================
-- 002: article_comments + RLS fixes
-- ============================================================

-- 1. article_comments（記事コメント）
-- ============================================================
create table public.article_comments (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  article_id  text not null,
  content     text not null,
  created_at  timestamptz not null default now()
);

create index idx_article_comments_article on public.article_comments(article_id);
create index idx_article_comments_user    on public.article_comments(user_id);

alter table public.article_comments enable row level security;

-- 全員が読める・自分だけ書ける・自分だけ消せる
create policy "article_comments_select" on public.article_comments
  for select using (true);

create policy "article_comments_insert" on public.article_comments
  for insert with check (auth.uid() = user_id);

create policy "article_comments_delete" on public.article_comments
  for delete using (auth.uid() = user_id);


-- 2. article_likes の RLS 修正
--    既存 "article_likes_own" は SELECT も自分だけに制限していた → いいね数が取得できない
-- ============================================================
drop policy if exists "article_likes_own" on public.article_likes;

-- 全員が読める（いいね数カウント用）
create policy "article_likes_select" on public.article_likes
  for select using (true);

-- 自分だけ書ける
create policy "article_likes_insert" on public.article_likes
  for insert with check (auth.uid() = user_id);

-- 自分だけ消せる
create policy "article_likes_delete" on public.article_likes
  for delete using (auth.uid() = user_id);


-- 3. article_saves の RLS 修正（自分のデータのみ）
-- ============================================================
drop policy if exists "article_saves_own" on public.article_saves;

create policy "article_saves_select" on public.article_saves
  for select using (auth.uid() = user_id);

create policy "article_saves_insert" on public.article_saves
  for insert with check (auth.uid() = user_id);

create policy "article_saves_delete" on public.article_saves
  for delete using (auth.uid() = user_id);
