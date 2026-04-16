-- ============================================================
-- SUBSCOPE — プロフィール更新カラム追加
-- 実行方法: Supabase Dashboard > SQL Editor に貼り付けて実行
-- ============================================================

-- profile_public / show_subscriptions（まだ存在しない場合のみ追加）
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS profile_public    boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_subscriptions boolean NOT NULL DEFAULT true;

-- username の unique インデックス（005 で unique 制約を追加済みだが念のため）
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON public.users (username)
  WHERE username IS NOT NULL;

-- username 検索を高速化（小文字での検索用）
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON public.users (lower(username))
  WHERE username IS NOT NULL;

-- username_changed_at インデックス（月1回制限チェック用）
CREATE INDEX IF NOT EXISTS idx_users_username_changed_at ON public.users (username_changed_at)
  WHERE username_changed_at IS NOT NULL;
