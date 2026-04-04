-- ============================================================
-- SUBSCOPE — 初期スキーマ
-- 実行方法: Supabase Dashboard > SQL Editor に貼り付けて実行
-- ============================================================

-- 拡張
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- 全文検索用

-- ============================================================
-- 1. users（プロフィール拡張）
-- auth.users は Supabase が管理するため、公開情報だけ持つ
-- ============================================================
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  plan          text not null default 'free' check (plan in ('free','standard','pro')),
  plan_expires_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.users is 'auth.users の公開プロフィール拡張テーブル';

-- ============================================================
-- 2. categories（サービスカテゴリ）
-- ============================================================
create table public.categories (
  id          serial primary key,
  slug        text not null unique,
  name        text not null,
  icon        text,           -- emoji or icon name
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

insert into public.categories (slug, name, icon, sort_order) values
  ('video',    '動画',         '🎬', 1),
  ('music',    '音楽',         '🎵', 2),
  ('reading',  '読書・マンガ', '📚', 3),
  ('game',     'ゲーム',       '🎮', 4),
  ('learning', '学習',         '✏️', 5),
  ('business', 'ビジネス',     '💼', 6),
  ('beauty',   '美容・ファッション', '✨', 7),
  ('fitness',  'フィットネス', '🏃', 8),
  ('food',     'フード',       '🍽️', 9),
  ('other',    'その他',       '🔍', 10);

-- ============================================================
-- 3. services（サブスクサービスマスタ）
-- ============================================================
create table public.services (
  id            uuid primary key default uuid_generate_v4(),
  category_id   int references public.categories(id),
  name          text not null,
  slug          text not null unique,
  description   text,
  logo_url      text,
  website_url   text,
  affiliate_url text,
  avg_rating    numeric(3,2) default 0,
  review_count  int default 0,
  is_featured   boolean not null default false,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- 4. plans（各サービスの料金プラン）
-- ============================================================
create table public.plans (
  id            uuid primary key default uuid_generate_v4(),
  service_id    uuid not null references public.services(id) on delete cascade,
  name          text not null,    -- "スタンダード", "プレミアム" など
  price         int  not null,    -- 円（月額換算）
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly','yearly','once')),
  features      text[],           -- プランの特徴リスト
  is_popular    boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- 5. tags
-- ============================================================
create table public.tags (
  id    serial primary key,
  name  text not null unique,
  slug  text not null unique
);

-- ============================================================
-- 6. service_tags（サービス ↔ タグ の中間テーブル）
-- ============================================================
create table public.service_tags (
  service_id  uuid not null references public.services(id) on delete cascade,
  tag_id      int  not null references public.tags(id) on delete cascade,
  primary key (service_id, tag_id)
);

-- ============================================================
-- 7. reviews（ユーザーレビュー）
-- ============================================================
create table public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  service_id  uuid not null references public.services(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  title       text,
  body        text,
  pros        text,
  cons        text,
  is_verified boolean not null default false,
  helpful_count int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (service_id, user_id)   -- 1サービス1レビュー
);

-- ============================================================
-- 8. favorites（お気に入り）
-- Free: 3件、Standard: 20件、Pro: 無制限
-- ============================================================
create table public.favorites (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  service_id  uuid not null references public.services(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, service_id)
);

-- ============================================================
-- 9. comparisons（比較リスト）
-- Free: 2件、Standard: 3件、Pro: 5件
-- ============================================================
create table public.comparisons (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  service_id  uuid not null references public.services(id) on delete cascade,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  unique (user_id, service_id)
);

-- ============================================================
-- 10. rankings（管理者が設定するランキング）
-- ============================================================
create table public.rankings (
  id            uuid primary key default uuid_generate_v4(),
  period        text not null default 'all' check (period in ('all','weekly','monthly')),
  service_id    uuid not null references public.services(id) on delete cascade,
  rank          int  not null,
  score         numeric(8,2) default 0,
  created_at    timestamptz not null default now(),
  unique (period, rank)
);

-- ============================================================
-- 11. diagnosis_questions（診断質問）
-- ============================================================
create table public.diagnosis_questions (
  id          serial primary key,
  diagnosis   text not null default 'lifestyle',  -- 診断種別
  question    text not null,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- 12. diagnosis_options（診断の選択肢）
-- ============================================================
create table public.diagnosis_options (
  id          serial primary key,
  question_id int  not null references public.diagnosis_questions(id) on delete cascade,
  label       text not null,
  value       text not null,
  sort_order  int  not null default 0
);

-- ============================================================
-- 13. diagnosis_results（診断結果ロジック）
-- ============================================================
create table public.diagnosis_results (
  id          serial primary key,
  diagnosis   text not null default 'lifestyle',
  service_id  uuid not null references public.services(id) on delete cascade,
  match_score int  not null default 0,
  conditions  jsonb,   -- どのオプションを選ぶとこのサービスが推奨されるか
  created_at  timestamptz not null default now()
);

-- ============================================================
-- 14. article_likes（記事いいね — microCMS記事ID で管理）
-- ============================================================
create table public.article_likes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  article_id  text not null,   -- microCMS のコンテンツID
  created_at  timestamptz not null default now(),
  unique (user_id, article_id)
);

-- ============================================================
-- 15. article_saves（記事保存）
-- ============================================================
create table public.article_saves (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  article_id  text not null,
  title       text,
  image_url   text,
  created_at  timestamptz not null default now(),
  unique (user_id, article_id)
);

-- ============================================================
-- 16. user_subscriptions（ユーザーが契約中のサブスクを記録）
-- ============================================================
create table public.user_subscriptions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  service_id  uuid not null references public.services(id) on delete cascade,
  plan_id     uuid references public.plans(id),
  started_at  date,
  ended_at    date,
  is_active   boolean not null default true,
  memo        text,
  created_at  timestamptz not null default now(),
  unique (user_id, service_id)
);

-- ============================================================
-- トリガー：updated_at 自動更新
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger trg_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- ============================================================
-- トリガー：reviews 変更時に services.avg_rating を更新
-- ============================================================
create or replace function public.update_service_rating()
returns trigger language plpgsql as $$
declare
  v_service_id uuid;
begin
  v_service_id := coalesce(new.service_id, old.service_id);
  update public.services
  set
    avg_rating   = (select avg(rating) from public.reviews where service_id = v_service_id),
    review_count = (select count(*)    from public.reviews where service_id = v_service_id)
  where id = v_service_id;
  return coalesce(new, old);
end;
$$;

create trigger trg_review_rating
  after insert or update or delete on public.reviews
  for each row execute function public.update_service_rating();

-- ============================================================
-- トリガー：auth.users 登録時に public.users を自動作成
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- インデックス
-- ============================================================
create index idx_services_category    on public.services(category_id);
create index idx_services_avg_rating  on public.services(avg_rating desc);
create index idx_services_slug        on public.services(slug);
create index idx_reviews_service      on public.reviews(service_id);
create index idx_reviews_user         on public.reviews(user_id);
create index idx_favorites_user       on public.favorites(user_id);
create index idx_comparisons_user     on public.comparisons(user_id);
create index idx_rankings_period      on public.rankings(period, rank);
create index idx_article_likes_user   on public.article_likes(user_id);
create index idx_article_saves_user   on public.article_saves(user_id);
create index idx_user_subs_user       on public.user_subscriptions(user_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table public.users             enable row level security;
alter table public.reviews           enable row level security;
alter table public.favorites         enable row level security;
alter table public.comparisons       enable row level security;
alter table public.article_likes     enable row level security;
alter table public.article_saves     enable row level security;
alter table public.user_subscriptions enable row level security;

-- users: 自分のプロフィールのみ更新可。全ユーザーが表示名は閲覧可
create policy "users_select_all"   on public.users for select using (true);
create policy "users_update_own"   on public.users for update using (auth.uid() = id);

-- reviews: 全員閲覧可。自分のみ作成・更新・削除
create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_insert_own" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_own" on public.reviews for update using (auth.uid() = user_id);
create policy "reviews_delete_own" on public.reviews for delete using (auth.uid() = user_id);

-- favorites: 自分のみ
create policy "favorites_own" on public.favorites using (auth.uid() = user_id);

-- comparisons: 自分のみ
create policy "comparisons_own" on public.comparisons using (auth.uid() = user_id);

-- article_likes: 自分のみ
create policy "article_likes_own" on public.article_likes using (auth.uid() = user_id);

-- article_saves: 自分のみ
create policy "article_saves_own" on public.article_saves using (auth.uid() = user_id);

-- user_subscriptions: 自分のみ
create policy "user_subs_own" on public.user_subscriptions using (auth.uid() = user_id);

-- services, categories, plans, tags, rankings は public 読み取り
create policy "services_select_all"   on public.services  for select using (true);
create policy "categories_select_all" on public.categories for select using (true);
create policy "plans_select_all"      on public.plans      for select using (true);
create policy "tags_select_all"       on public.tags       for select using (true);
create policy "rankings_select_all"   on public.rankings   for select using (true);

alter table public.services    enable row level security;
alter table public.categories  enable row level security;
alter table public.plans       enable row level security;
alter table public.tags        enable row level security;
alter table public.rankings    enable row level security;

-- ============================================================
-- サンプルデータ（開発用）
-- ============================================================
insert into public.services (name, slug, category_id, description, website_url, avg_rating, review_count, is_featured) values
  ('Netflix',          'netflix',          (select id from public.categories where slug='video'),    '世界最大の動画配信サービス。映画・ドラマ・アニメが見放題。',           'https://www.netflix.com',      4.8, 0, true),
  ('Spotify',          'spotify',          (select id from public.categories where slug='music'),    '音楽・ポッドキャストが聴き放題。5000万曲以上が揃う。',               'https://www.spotify.com',      4.7, 0, true),
  ('Amazon Prime',     'amazon-prime',     (select id from public.categories where slug='video'),    '動画配信・送料無料・音楽・ゲームなど多彩な特典。',                   'https://www.amazon.co.jp',     4.6, 0, true),
  ('Disney+',          'disney-plus',      (select id from public.categories where slug='video'),    'Disney・Marvel・Star Wars・ピクサー作品が見放題。',                  'https://www.disneyplus.com',   4.5, 0, false),
  ('Kindle Unlimited', 'kindle-unlimited', (select id from public.categories where slug='reading'),  '電子書籍・マンガ・雑誌が月額定額で読み放題。',                       'https://www.amazon.co.jp',     4.5, 0, true),
  ('Adobe CC',         'adobe-cc',         (select id from public.categories where slug='business'), 'Photoshop・Illustrator・Premiere Proなど全クリエイティブツール。', 'https://www.adobe.com',        4.3, 0, false),
  ('Duolingo Plus',    'duolingo-plus',    (select id from public.categories where slug='learning'), '語学学習アプリのプレミアムプラン。広告なしでフル機能を利用。',         'https://www.duolingo.com',     4.2, 0, false),
  ('Nintendo Switch Online', 'nintendo-switch-online', (select id from public.categories where slug='game'), 'Nintendo Switchのオンラインプレイ・クラシックゲームが遊べる。', 'https://www.nintendo.com', 4.1, 0, false);

insert into public.plans (service_id, name, price, billing_cycle, is_popular) values
  ((select id from public.services where slug='netflix'),          'スタンダード',  1490, 'monthly', false),
  ((select id from public.services where slug='netflix'),          'プレミアム',    1980, 'monthly', true),
  ((select id from public.services where slug='spotify'),          'プレミアム',     980, 'monthly', true),
  ((select id from public.services where slug='amazon-prime'),     '月額プラン',     600, 'monthly', false),
  ((select id from public.services where slug='amazon-prime'),     '年額プラン',     233, 'yearly',  true),
  ((select id from public.services where slug='disney-plus'),      'スタンダード',  990, 'monthly',  true),
  ((select id from public.services where slug='kindle-unlimited'), '月額プラン',     980, 'monthly', true),
  ((select id from public.services where slug='adobe-cc'),         'コンプリート',  6480, 'monthly', true),
  ((select id from public.services where slug='duolingo-plus'),    'Plus',          960, 'monthly',  true),
  ((select id from public.services where slug='nintendo-switch-online'), '個人プラン', 250, 'monthly', true);
