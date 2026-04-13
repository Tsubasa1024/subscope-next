-- ============================================================
-- SUBSCOPE — ユーザー設定カラム追加
-- 実行方法: Supabase Dashboard > SQL Editor に貼り付けて実行
-- ============================================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS notification_new_article boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notification_review_reply boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS username text unique,
  ADD COLUMN IF NOT EXISTS username_changed_at timestamptz;
