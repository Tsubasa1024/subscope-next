-- 緊急修正: handle_new_user トリガーに email を追加
-- users.email が NOT NULL 制約のため、auth.users 作成時に email を含めないと
-- INSERT が失敗し、新規ユーザー登録が全件エラーになっていた。
--
-- 併せて users テーブルの email 列定義を記録する。
-- (email 列自体は本番 DB に手動追加済み)

-- email 列が未作成の環境向け（重複実行しても安全）
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '';

-- DEFAULT '' は ADD COLUMN 時の一時的な措置。
-- 既存行に email を埋めた後、以下で DEFAULT を外すこと:
--   ALTER TABLE public.users ALTER COLUMN email DROP DEFAULT;

-- handle_new_user トリガー関数を email 込みに更新
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;
