-- ============================================================
-- SUBSCOPE — サービスレビュー（1〜10点スコア）
-- 実行方法: Supabase Dashboard > SQL Editor に貼り付けて実行
--
-- NOTE: public.services テーブルは 001_init.sql で作成済み。
--       このファイルでは service_reviews のみ追加する。
-- ============================================================

-- ユーザーレビュー（1〜10点スコア）
create table public.service_reviews (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  service_id  uuid not null references public.services(id) on delete cascade,
  score       integer not null check (score >= 1 and score <= 10),
  good_points text,
  bad_points  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, service_id)
);

-- updated_at 自動更新トリガー
create trigger trg_service_reviews_updated_at
  before update on public.service_reviews
  for each row execute function public.set_updated_at();

-- RLS
alter table public.service_reviews enable row level security;

create policy "service_reviews_read"   on public.service_reviews for select using (true);
create policy "service_reviews_insert" on public.service_reviews for insert with check (auth.uid() = user_id);
create policy "service_reviews_update" on public.service_reviews for update using (auth.uid() = user_id);
create policy "service_reviews_delete" on public.service_reviews for delete using (auth.uid() = user_id);

-- インデックス
create index idx_service_reviews_service on public.service_reviews(service_id);
create index idx_service_reviews_user    on public.service_reviews(user_id);
