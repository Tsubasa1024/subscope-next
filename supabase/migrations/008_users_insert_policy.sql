-- 緊急修正: users テーブルの INSERT ポリシー
-- 新規ユーザーがオンボーディング時に自分のプロフィール行を作成できるようにする。
-- RLSにより auth.uid() と一致する id のみ INSERT 可能。
--
-- 注意: Supabase 本番環境には手動で適用済み。
--       本ファイルは別環境構築時の再現用として記録する。

CREATE POLICY "users_insert_own"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
